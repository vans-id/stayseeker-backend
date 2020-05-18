const fs = require('fs-extra');
const path = require('path');

const Category = require('../models/Category');
const Bank = require('../models/Bank');
const Item = require('../models/Item');
const Image = require('../models/Image');

module.exports = {
  viewDashboard: (req, res, next) => {
    res.render('admin/dashboard/view_dashboard', {
      title: 'Stayseeker | Dashboard',
    });
  },
  // Categories
  viewCategory: async (req, res, next) => {
    try {
      const categories = await Category.find();
      const alertMessage = req.flash('alertMessage');
      const alertStatus = req.flash('alertStatus');
      const alert = {
        message: alertMessage,
        status: alertStatus,
      };
      res.render('admin/category/view_category', {
        categories,
        alert,
        title: 'Stayseeker | Category',
      });
    } catch (error) {
      req.flash('alertMessage', `${error.message}`);
      req.flash('alertStatus', 'danger');
      res.redirect('/admin/dashboard');
    }
  },
  addCategory: async (req, res, next) => {
    try {
      const { name } = req.body;

      await Category.create({ name });

      req.flash(
        'alertMessage',
        'New Category has been added'
      );
      req.flash('alertStatus', 'success');
      res.redirect('/admin/category');
    } catch (error) {
      req.flash('alertMessage', `${error.message}`);
      req.flash('alertStatus', 'danger');
      res.redirect('/admin/category');
    }
  },
  editCategory: async (req, res, next) => {
    try {
      const { id, name } = req.body;
      const selectedCategory = await Category.findById(
        id
      );
      selectedCategory.name = name;
      req.flash(
        'alertMessage',
        'Selected category has been edited'
      );
      req.flash('alertStatus', 'success');

      await selectedCategory.save();
      res.redirect('/admin/category');
    } catch (error) {
      req.flash('alertMessage', `${error.message}`);
      req.flash('alertStatus', 'danger');
      res.redirect('/admin/category');
    }
  },
  deleteCategory: async (req, res, next) => {
    try {
      const { id } = req.params;
      const selectedCategory = await Category.findById(
        id
      );
      req.flash(
        'alertMessage',
        'Selected category has been deleted'
      );
      req.flash('alertStatus', 'success');

      await selectedCategory.remove();
      res.redirect('/admin/category');
    } catch (error) {
      req.flash('alertMessage', `${error.message}`);
      req.flash('alertStatus', 'danger');
      res.redirect('/admin/category');
    }
  },
  // Banks
  viewBank: async (req, res, next) => {
    try {
      const banks = await Bank.find();

      const alertMessage = req.flash('alertMessage');
      const alertStatus = req.flash('alertStatus');
      const alert = {
        message: alertMessage,
        status: alertStatus,
      };

      res.render('admin/bank/view_bank', {
        title: 'Stayseeker | Bank',
        alert,
        banks,
      });
    } catch (error) {
      req.flash('alertMessage', `${error.message}`);
      req.flash('alertStatus', 'danger');
      res.redirect('/admin/dashboard');
    }
  },
  addBank: async (req, res, next) => {
    try {
      const { bankName, accNumber, name } = req.body;

      await Bank.create({
        bankName,
        accNumber,
        name,
        imageUrl: `images/${req.file.filename}`,
      });

      req.flash(
        'alertMessage',
        'New Bank has been added'
      );
      req.flash('alertStatus', 'success');
      res.redirect('/admin/bank');
    } catch (error) {
      req.flash('alertMessage', `${error.message}`);
      req.flash('alertStatus', 'danger');
      res.redirect('/admin/bank');
    }
  },
  editBank: async (req, res, next) => {
    try {
      const {
        id,
        bankName,
        accNumber,
        name,
      } = req.body;
      const selectedBank = await Bank.findById(id);
      console.log(selectedBank);

      if (req.file === undefined) {
        selectedBank.bankName = bankName;
        selectedBank.accNumber = accNumber;
        selectedBank.name = name;

        await selectedBank.save();
      } else {
        await fs.unlink(
          path.join(`public/${selectedBank.imageUrl}`)
        );

        selectedBank.bankName = bankName;
        selectedBank.accNumber = accNumber;
        selectedBank.name = name;
        selectedBank.imageUrl = `images/${req.file.filename}`;

        await selectedBank.save();
      }

      req.flash(
        'alertMessage',
        'Selected bank has been updated'
      );
      req.flash('alertStatus', 'success');
      res.redirect('/admin/bank');
    } catch (error) {
      req.flash('alertMessage', `${error.message}`);
      req.flash('alertStatus', 'danger');
      res.redirect('/admin/bank');
    }
  },
  deleteBank: async (req, res, next) => {
    try {
      const { id } = req.params;
      const selectedBank = await Bank.findById(id);

      await fs.unlink(
        path.join(`public/${selectedBank.imageUrl}`)
      );
      await selectedBank.remove();

      req.flash(
        'alertMessage',
        'Selected bank has been deleted'
      );
      req.flash('alertStatus', 'success');
      res.redirect('/admin/bank');
    } catch (error) {
      req.flash('alertMessage', `${error.message}`);
      req.flash('alertStatus', 'danger');
      res.redirect('/admin/bank');
    }
  },
  // Items
  viewItem: async (req, res, next) => {
    try {
      const categories = await Category.find();

      const alertMessage = req.flash('alertMessage');
      const alertStatus = req.flash('alertStatus');
      const alert = {
        message: alertMessage,
        status: alertStatus,
      };

      res.render('admin/item/view_item', {
        title: 'Stayseeker | Our Items',
        alert,
        categories,
      });
    } catch (error) {
      req.flash('alertMessage', `${error.message}`);
      req.flash('alertStatus', 'danger');
      res.redirect('/admin/item');
    }
  },
  addItem: async (req, res, next) => {
    try {
      const {
        title,
        price,
        city,
        country,
        categoryId,
        description,
      } = req.body;

      if (req.files.length > 0) {
        const selectedCategory = await Category.findById(
          categoryId
        );

        const newItem = {
          categoryId: selectedCategory._id,
          title,
          price,
          city,
          country,
          description,
        };

        const createdItem = await Item.create(newItem);

        selectedCategory.itemId.push({
          _id: createdItem._id,
        });
        await selectedCategory.save();

        for (let i = 0; i < req.files.length; i++) {
          const createdImage = await Image.create({
            imageUrl: `images/${req.files[i].filename}`,
          });

          createdItem.imageId.push({
            _id: createdImage._id,
          });
          await createdItem.save();
        }
      }

      req.flash(
        'alertMessage',
        'New Item has been added'
      );
      req.flash('alertStatus', 'success');
      res.redirect('/admin/item');
    } catch (error) {
      req.flash('alertMessage', `${error.message}`);
      req.flash('alertStatus', 'danger');
      res.redirect('/admin/item');
    }
  },
  // Booking
  viewBooking: (req, res, next) => {
    res.render('admin/booking/view_booking', {
      title: 'Stayseeker | Booking Status',
    });
  },
};
