/**
 * @fileoverview High-performance in-memory database mock for Jest integration tests.
 * Provides offline-resilient execution for User, Category, Expense, Budget, and Notification
 * Mongoose models without external MongoDB network dependencies.
 */

import mongoose from 'mongoose';
import { User } from '../src/models/User.js';
import { Category } from '../src/models/Category.js';
import { Expense } from '../src/models/Expense.js';
import { Budget } from '../src/models/Budget.js';
import { Notification } from '../src/models/Notification.js';

export const memoryStore = {
  users: [],
  categories: [],
  expenses: [],
  budgets: [],
  notifications: [],
};

export function clearMemoryStore() {
  memoryStore.users = [];
  memoryStore.categories = [];
  memoryStore.expenses = [];
  memoryStore.budgets = [];
  memoryStore.notifications = [];
}

function newId() {
  return new mongoose.Types.ObjectId().toString();
}

/**
 * Normalizes document with _id, id, timestamps, and populate/save methods.
 */
function createDoc(data) {
  const _id = data._id ? data._id.toString() : newId();
  const doc = {
    ...data,
    _id,
    id: _id,
    createdAt: data.createdAt || new Date(),
    updatedAt: data.updatedAt || new Date(),
    save: async function () {
      this.updatedAt = new Date();
      return this;
    },
    populate: async function (field) {
      if (field === 'category') {
        const catId = this.category ? (this.category._id || this.category).toString() : null;
        if (catId) {
          const cat = memoryStore.categories.find((c) => c._id.toString() === catId);
          this.category = cat ? createDoc(cat) : { name: 'Food', color: '#EF4444', icon: 'utensils' };
        }
      }
      return this;
    },
  };
  return doc;
}

let installed = false;

export function installMongooseMock() {
  if (installed) return;
  installed = true;

  // --- USER MOCK ---
  User.findOne = async function (filter) {
    const found = memoryStore.users.find((u) => {
      if (filter.uid && u.uid === filter.uid) return true;
      if (filter._id && u._id === filter._id.toString()) return true;
      return false;
    });
    return found ? createDoc(found) : null;
  };

  User.findById = async function (id) {
    const found = memoryStore.users.find((u) => u._id === id.toString());
    return found ? createDoc(found) : null;
  };

  User.create = async function (data) {
    const doc = createDoc(data);
    memoryStore.users.push(doc);
    return doc;
  };

  User.findByIdAndUpdate = async function (id, updates, _opts) {
    const doc = memoryStore.users.find((u) => u._id === id.toString());
    if (!doc) return null;
    if (updates.$set) {
      Object.assign(doc, updates.$set);
    } else {
      Object.assign(doc, updates);
    }
    return createDoc(doc);
  };

  // --- CATEGORY MOCK ---
  Category.find = function (filter = {}) {
    const results = memoryStore.categories.filter((c) => {
      if (filter.user && c.user.toString() !== filter.user.toString()) return false;
      return true;
    });
    return {
      sort: () => results.map(createDoc),
      then: (resolve) => resolve(results.map(createDoc)),
    };
  };

  Category.findOne = async function (filter) {
    const found = memoryStore.categories.find((c) => {
      if (filter.user && c.user.toString() !== filter.user.toString()) return false;
      if (filter.name && c.name.toLowerCase() !== filter.name.toLowerCase()) return false;
      if (filter._id && c._id.toString() !== filter._id.toString()) return false;
      return true;
    });
    return found ? createDoc(found) : null;
  };

  Category.create = async function (data) {
    const doc = createDoc(data);
    memoryStore.categories.push(doc);
    return doc;
  };

  Category.insertMany = async function (docs) {
    const created = docs.map(createDoc);
    memoryStore.categories.push(...created);
    return created;
  };

  Category.deleteOne = async function (filter) {
    const idx = memoryStore.categories.findIndex((c) => c._id.toString() === filter._id.toString());
    if (idx !== -1) {
      memoryStore.categories.splice(idx, 1);
      return { deletedCount: 1 };
    }
    return { deletedCount: 0 };
  };

  // --- EXPENSE MOCK ---
  Expense.find = function (query = {}) {
    let items = memoryStore.expenses.filter((e) => {
      if (query.user && (e.user?._id || e.user).toString() !== query.user.toString()) return false;
      if (query.category && (e.category?._id || e.category).toString() !== query.category.toString()) return false;
      if (query.paymentMethod && e.paymentMethod !== query.paymentMethod) return false;
      if (query.$or && query.$or.length > 0) {
        const matchesQ = query.$or.some((clause) => {
          const field = Object.keys(clause)[0];
          const reg = clause[field];
          return reg && reg.test && reg.test(e[field] || '');
        });
        if (!matchesQ) return false;
      }
      return true;
    });

    const chain = {
      populate: (field, _select) => {
        if (field === 'category') {
          items = items.map((exp) => {
            const cat = memoryStore.categories.find((c) => c._id.toString() === (exp.category._id || exp.category).toString());
            return { ...exp, category: cat ? createDoc(cat) : { name: 'Food', color: '#EF4444' } };
          });
        }
        return chain;
      },
      sort: (sortObj) => {
        const key = Object.keys(sortObj)[0];
        const dir = sortObj[key];
        items.sort((a, b) => (dir === -1 ? (b[key] > a[key] ? 1 : -1) : a[key] > b[key] ? 1 : -1));
        return chain;
      },
      skip: (skipCount) => {
        items = items.slice(skipCount);
        return chain;
      },
      limit: (limitCount) => {
        items = items.slice(0, limitCount);
        return chain;
      },
      cursor: () => {
        let index = 0;
        return {
          [Symbol.asyncIterator]() {
            return {
              async next() {
                if (index < items.length) {
                  const val = items[index++];
                  const cat = memoryStore.categories.find((c) => c._id.toString() === (val.category?._id || val.category)?.toString());
                  return { value: { ...val, category: cat ? createDoc(cat) : { name: 'Other' } }, done: false };
                }
                return { done: true };
              },
            };
          },
        };
      },
      then: (resolve) => resolve(items.map(createDoc)),
    };
    return chain;
  };

  Expense.countDocuments = async function (query = {}) {
    return memoryStore.expenses.filter((e) => {
      if (query.user && (e.user?._id || e.user).toString() !== query.user.toString()) return false;
      if (query.category && (e.category?._id || e.category).toString() !== query.category.toString()) return false;
      return true;
    }).length;
  };

  Expense.create = async function (data) {
    const doc = createDoc(data);
    memoryStore.expenses.push(doc);
    const cat = memoryStore.categories.find((c) => c._id.toString() === (doc.category?._id || doc.category)?.toString());
    doc.category = cat ? createDoc(cat) : { name: 'Food', color: '#EF4444' };
    return doc;
  };

  Expense.findOne = function (filter) {
    const found = memoryStore.expenses.find((e) => {
      if (filter._id && e._id.toString() !== filter._id.toString()) return false;
      if (filter.user && (e.user?._id || e.user).toString() !== filter.user.toString()) return false;
      return true;
    });

    const chain = {
      populate: function (field) {
        if (field === 'category' && found) {
          const cat = memoryStore.categories.find((c) => c._id.toString() === (found.category?._id || found.category)?.toString());
          found.category = cat ? createDoc(cat) : { name: 'Food' };
        }
        return chain;
      },
      then: (resolve) => resolve(found ? createDoc(found) : null),
    };
    return chain;
  };

  Expense.findById = function (id) {
    const found = memoryStore.expenses.find((e) => e._id.toString() === id.toString());
    const chain = {
      populate: function (field) {
        if (field === 'category' && found) {
          const cat = memoryStore.categories.find((c) => c._id.toString() === (found.category?._id || found.category)?.toString());
          found.category = cat ? createDoc(cat) : { name: 'Other' };
        }
        return chain;
      },
      then: (resolve) => resolve(found ? createDoc(found) : null),
    };
    return chain;
  };

  Expense.findOneAndDelete = async function (filter) {
    const idx = memoryStore.expenses.findIndex((e) => e._id.toString() === filter._id.toString());
    if (idx !== -1) {
      return createDoc(memoryStore.expenses.splice(idx, 1)[0]);
    }
    return null;
  };

  Expense.updateMany = async function (filter, updates) {
    let count = 0;
    for (const exp of memoryStore.expenses) {
      const expCatId = (exp.category?._id || exp.category).toString();
      const filterCatId = (filter.category?._id || filter.category).toString();
      if (expCatId === filterCatId) {
        if (updates.$set) Object.assign(exp, updates.$set);
        count++;
      }
    }
    return { modifiedCount: count };
  };

  Expense.aggregate = async function (pipeline) {
    let items = [...memoryStore.expenses];
    const matchStage = pipeline.find((p) => p.$match);
    if (matchStage) {
      const filter = matchStage.$match;
      items = items.filter((e) => {
        if (filter.user) {
          const eUserId = (e.user?._id || e.user)?.toString();
          const filterUserId = (filter.user?._id || filter.user)?.toString();
          if (eUserId !== filterUserId) return false;
        }

        if (filter.category) {
          const eCatId = (e.category?._id || e.category).toString();
          const filterCatId = (filter.category?._id || filter.category).toString();
          if (eCatId !== filterCatId) return false;
        }

        if (filter['recurring.enabled'] !== undefined && e.recurring?.enabled !== filter['recurring.enabled']) return false;
        if (filter.date) {
          const d = new Date(e.date);
          if (filter.date.$gte && d < new Date(filter.date.$gte)) return false;
          if (filter.date.$lte && d > new Date(filter.date.$lte)) return false;
        }
        return true;
      });
    }

    const groupStage = pipeline.find((p) => p.$group);
    if (!groupStage) return items;

    const groupField = groupStage.$group._id;

    if (groupField === null) {
      const total = items.reduce((acc, curr) => acc + (curr.amount || 0), 0);
      return [{ _id: null, total, totalSpent: total, expenseCount: items.length }];
    }

    if (groupField === '$category') {
      const map = new Map();
      for (const item of items) {
        const catId = (item.category?._id || item.category).toString();
        const prev = map.get(catId) || { _id: catId, total: 0, count: 0 };
        prev.total += item.amount || 0;
        prev.count += 1;
        map.set(catId, prev);
      }
      const results = Array.from(map.values());
      results.sort((a, b) => b.total - a.total);
      return results.map((r) => {
        const cat = memoryStore.categories.find((c) => c._id.toString() === r._id);
        return {
          ...r,
          actual: r.total,
          categoryInfo: cat || { name: 'Food', color: '#EF4444', icon: 'utensils' },
        };
      });
    }

    // Monthly trends group: { $dateToString: { format: '%Y-%m', date: '$date' } }
    if (typeof groupField === 'object' && groupField.$dateToString?.format === '%Y-%m') {
      const map = new Map();
      for (const item of items) {
        const d = new Date(item.date);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const prev = map.get(key) || { _id: key, total: 0, count: 0 };
        prev.total += item.amount || 0;
        prev.count += 1;
        map.set(key, prev);
      }
      return Array.from(map.values());
    }

    // Daily spend dates: { $dateToString: { format: '%Y-%m-%d', date: '$date' } }
    if (typeof groupField === 'object' && groupField.$dateToString?.format === '%Y-%m-%d') {
      const set = new Set();
      for (const item of items) {
        const d = new Date(item.date);
        set.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
      }
      return Array.from(set).map((date) => ({ _id: date }));
    }

    // Yearly group: { $year: '$date' }
    if (typeof groupField === 'object' && groupField.$year) {
      const map = new Map();
      for (const item of items) {
        const d = new Date(item.date);
        const yr = d.getFullYear();
        const prev = map.get(yr) || { year: yr, total: 0, count: 0 };
        prev.total += item.amount || 0;
        prev.count += 1;
        map.set(yr, prev);
      }
      return Array.from(map.values());
    }

    return [{ _id: null, total: 0, count: 0 }];
  };

  // --- BUDGET MOCK ---
  Budget.find = function (filter = {}) {
    const results = memoryStore.budgets.filter((b) => {
      const bUserId = (b.user?._id || b.user).toString();
      const fUserId = (filter.user?._id || filter.user).toString();
      if (filter.user && bUserId !== fUserId) return false;
      if (filter.month && b.month !== filter.month) return false;
      return true;
    });

    const chain = {
      populate: (field) => {
        if (field === 'category') {
          results.forEach((b) => {
            if (b.category) {
              const catId = (b.category._id || b.category).toString();
              const cat = memoryStore.categories.find((c) => c._id.toString() === catId);
              b.category = cat ? createDoc(cat) : null;
            }
          });
        }
        return chain;
      },
      sort: () => chain,
      then: (resolve) => resolve(results.map(createDoc)),
    };
    return chain;
  };

  Budget.findOne = function (filter = {}) {
    const found = memoryStore.budgets.find((b) => {
      if (filter._id && b._id.toString() !== filter._id.toString()) return false;
      if (filter.user && (b.user?._id || b.user).toString() !== filter.user.toString()) return false;
      return true;
    });

    const chain = {
      populate: (field) => {
        if (found && field === 'category' && found.category) {
          const catId = (found.category._id || found.category).toString();
          const cat = memoryStore.categories.find((c) => c._id.toString() === catId);
          found.category = cat ? createDoc(cat) : null;
        }
        return chain;
      },
      then: (resolve) => resolve(found ? createDoc(found) : null),
    };
    return chain;
  };

  Budget.findOneAndUpdate = function (filter, updates, _opts) {
    let doc = memoryStore.budgets.find((b) => {
      const bUserId = (b.user?._id || b.user).toString();
      const fUserId = (filter.user?._id || filter.user).toString();
      if (filter.user && bUserId !== fUserId) return false;
      if (filter.month && b.month !== filter.month) return false;
      const bCat = b.category ? (b.category._id || b.category).toString() : null;
      const fCat = filter.category ? (filter.category._id || filter.category).toString() : null;
      return bCat === fCat;
    });

    if (!doc) {
      doc = createDoc({
        user: filter.user,
        category: filter.category,
        month: filter.month,
        ...(updates.$set || updates),
      });
      memoryStore.budgets.push(doc);
    } else {
      Object.assign(doc, updates.$set || updates);
    }

    const resObj = createDoc(doc);
    const chain = {
      populate: (field) => {
        if (field === 'category' && resObj.category) {
          const catId = (resObj.category._id || resObj.category).toString();
          const cat = memoryStore.categories.find((c) => c._id.toString() === catId);
          resObj.category = cat ? createDoc(cat) : null;
        }
        return chain;
      },
      then: (resolve) => resolve(resObj),
    };
    return chain;
  };

  Budget.findOneAndDelete = async function (filter) {
    const idx = memoryStore.budgets.findIndex((b) => b._id.toString() === filter._id.toString());
    if (idx !== -1) {
      return createDoc(memoryStore.budgets.splice(idx, 1)[0]);
    }
    return null;
  };

  Budget.deleteMany = async function (filter) {
    memoryStore.budgets = memoryStore.budgets.filter((b) => {
      if (filter.user && b.user.toString() === filter.user.toString()) {
        if (filter.category && b.category?.toString() === filter.category.toString()) return false;
      }
      return true;
    });
    return { deletedCount: 1 };
  };

  Budget.create = async function (data) {
    if (Array.isArray(data)) {
      const docs = data.map(createDoc);
      memoryStore.budgets.push(...docs);
      return docs;
    }
    const doc = createDoc(data);
    memoryStore.budgets.push(doc);
    return doc;
  };

  // --- NOTIFICATION MOCK ---
  Notification.find = function (filter = {}) {
    const results = memoryStore.notifications.filter((n) => {
      if (filter.user && (n.user?._id || n.user).toString() !== (filter.user?._id || filter.user).toString()) return false;
      if (filter.type && n.type !== filter.type) return false;
      if (filter.read !== undefined && n.read !== filter.read) return false;
      return true;
    });

    return {
      sort: () => ({ limit: () => results.map(createDoc) }),
      then: (resolve) => resolve(results.map(createDoc)),
    };
  };

  Notification.findOne = async function (filter = {}) {
    const found = memoryStore.notifications.find((n) => {
      if (filter.user && (n.user?._id || n.user).toString() !== (filter.user?._id || filter.user).toString()) return false;
      if (filter.type && n.type !== filter.type) return false;
      if (filter['meta.budgetId'] && n.meta?.budgetId !== filter['meta.budgetId']) return false;
      if (filter['meta.month'] && n.meta?.month !== filter['meta.month']) return false;
      return true;
    });
    return found ? createDoc(found) : null;
  };

  Notification.create = async function (data) {
    if (Array.isArray(data)) {
      const docs = data.map(createDoc);
      memoryStore.notifications.push(...docs);
      return docs;
    }
    const doc = createDoc(data);
    memoryStore.notifications.push(doc);
    return doc;
  };

  Notification.findOneAndUpdate = async function (filter, updates) {
    const found = memoryStore.notifications.find((n) => n._id.toString() === filter._id.toString());
    if (found) {
      Object.assign(found, updates.$set || updates);
      return createDoc(found);
    }
    return null;
  };

  Notification.updateMany = async function (filter, updates) {
    let count = 0;
    for (const n of memoryStore.notifications) {
      if (filter.user && (n.user?._id || n.user).toString() === (filter.user?._id || filter.user).toString()) {
        if (filter.read !== undefined && n.read !== filter.read) continue;
        Object.assign(n, updates.$set || updates);
        count++;
      }
    }
    return { modifiedCount: count };
  };
}
