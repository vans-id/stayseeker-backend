const fs = require('fs-extra');
const path = require('path');

const Category = require('../models/Category');
const Bank = require('../models/Bank');
const Item = require('../models/Item');
const Image = require('../models/Image');
const Feature = require('../models/Feature');

module.exports = {
  viewDashboard: (req, res) => {
    res.render('admin/dashboard/view_dashboard', {
      title: 'Stayseeker | Dashboard',
    });
  },
  // Categories
  viewCategory: async (req, res) => {
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
  addCategory: async (req, res) => {
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
  editCategory: async (req, res) => {
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
  deleteCategory: async (req, res) => {
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
  viewBank: async (req, res) => {
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
  addBank: async (req, res) => {
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
  editBank: async (req, res) => {
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
  deleteBank: async (req, res) => {
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
  viewItem: async (req, res) => {
    try {
      const categories = await Category.find();
      const items = await Item.find()
        .populate({
          path: 'imageId',
          select: 'id imageUrl',
        })
        .populate({
          path: 'categoryId',
          select: 'id name',
        });

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
        items,
        action: 'view',
      });
    } catch (error) {
      req.flash('alertMessage', `${error.message}`);
      req.flash('alertStatus', 'danger');
      res.redirect('/admin/item');
    }
  },
  addItem: async (req, res) => {
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
  showImageItem: async (req, res) => {
    try {
      const { id } = req.params;
      const selectedItem = await Item.findById(
        id
      ).populate({
        path: 'imageId',
        select: 'id imageUrl',
      });

      const alertMessage = req.flash('alertMessage');
      const alertStatus = req.flash('alertStatus');
      const alert = {
        message: alertMessage,
        status: alertStatus,
      };

      res.render('admin/item/view_item', {
        title: 'Stayseeker | Show Image',
        alert,
        selectedItem,
        action: 'show image',
      });
    } catch (error) {
      req.flash('alertMessage', `${error.message}`);
      req.flash('alertStatus', 'danger');
      res.redirect('/admin/item');
    }
  },
  showEditItem: async (req, res) => {
    try {
      const { id } = req.params;
      const selectedItem = await Item.findById(id)
        .populate({
          path: 'imageId',
          select: 'id imageUrl',
        })
        .populate({
          path: 'categoryId',
          select: 'id name',
        });

      const selectedCategory = await Category.find();

      const alertMessage = req.flash('alertMessage');
      const alertStatus = req.flash('alertStatus');
      const alert = {
        message: alertMessage,
        status: alertStatus,
      };

      res.render('admin/item/view_item', {
        title: 'Stayseeker | Edit Item',
        alert,
        selectedItem,
        selectedCategory,
        action: 'edit',
      });
    } catch (error) {
      req.flash('alertMessage', `${error.message}`);
      req.flash('alertStatus', 'danger');
      res.redirect('/admin/item');
    }
  },
  editItem: async (req, res) => {
    const { id } = req.params;
    const {
      title,
      price,
      city,
      country,
      categoryId,
      description,
    } = req.body;

    try {
      const updatedItem = await Item.findById(id)
        .populate({
          path: 'imageId',
          select: 'id imageUrl',
        })
        .populate({
          path: 'categoryId',
          select: 'id name',
        });

      if (req.files.length > 0) {
        for (
          let i = 0;
          i < updatedItem.imageId.length;
          i++
        ) {
          const updatedImage = await Image.findById(
            updatedItem.imageId[i]._id
          );

          await fs.unlink(
            path.join(
              `public/${updatedImage.imageUrl}`
            )
          );
          updatedImage.imageUrl = `images/${req.files[i].filename}`;
          await updatedImage.save();
        }
      }

      updatedItem.title = title;
      updatedItem.price = price;
      updatedItem.city = city;
      updatedItem.country = country;
      updatedItem.categoryId = categoryId;
      updatedItem.description = description;

      await updatedItem.save();

      req.flash(
        'alertMessage',
        'Selected Item has been updated'
      );
      req.flash('alertStatus', 'success');
      res.redirect('/admin/item');
    } catch (error) {
      req.flash('alertMessage', `${error.message}`);
      req.flash('alertStatus', 'danger');
      res.redirect(`/admin/item/${id}`);
    }
  },
  deleteItem: async (req, res) => {
    try {
      const { id } = req.params;
      const deletedItem = await Item.findById(
        id
      ).populate('imageId');

      for (
        let i = 0;
        i < deletedItem.imageId.length;
        i++
      ) {
        try {
          const deletedImage = await Image.findById(
            deletedItem.imageId[i]._id
          );

          await fs.unlink(
            path.join(
              `public/${deletedImage.imageUrl}`
            )
          );
          deletedImage.remove();
        } catch (error) {
          req.flash(
            'alertMessage',
            `${error.message}`
          );
          req.flash('alertStatus', 'danger');
          res.redirect(`/admin/item`);
        }
      }

      await deletedItem.remove();

      req.flash(
        'alertMessage',
        'Selected Item has been deleted'
      );
      req.flash('alertStatus', 'success');
      res.redirect('/admin/item');
    } catch (error) {
      req.flash('alertMessage', `${error.message}`);
      req.flash('alertStatus', 'danger');
      res.redirect(`/admin/item`);
    }
  },
  // Detail Item
  viewDetailItem: async (req, res) => {
    const { itemId } = req.params;

    try {
      const features = await Feature.find({ itemId });

      const alertMessage = req.flash('alertMessage');
      const alertStatus = req.flash('alertStatus');
      const alert = {
        message: alertMessage,
        status: alertStatus,
      };

      res.render(
        'admin/item/detail_item/view_detail_item',
        {
          title: 'Stayseeker | Detail Item',
          alert,
          itemId,
          features,
        }
      );
    } catch (error) {
      req.flash('alertMessage', `${error.message}`);
      req.flash('alertStatus', 'danger');
      res.redirect(
        `/admin/item/show-detail-item/${itemId}`
      );
    }
  },
  addFeature: async (req, res) => {
    const { name, qty, itemId } = req.body;

    try {
      if (req.file === undefined) {
        req.flash('alertMessage', `Missing Image`);
        req.flash('alertStatus', 'danger');
        res.redirect(
          `/admin/item/show-detail-item/${itemId}`
        );
      }

      const newFeature = await Feature.create({
        name,
        qty,
        itemId,
        imageUrl: `images/${req.file.filename}`,
      });

      const selectedItem = await Item.findById(itemId);
      selectedItem.featureId.push({
        _id: newFeature._id,
      });
      await selectedItem.save();

      req.flash(
        'alertMessage',
        'New Feature has been added'
      );
      req.flash('alertStatus', 'success');
      res.redirect(
        `/admin/item/show-detail-item/${itemId}`
      );
    } catch (error) {
      req.flash('alertMessage', `${error.message}`);
      req.flash('alertStatus', 'danger');
      res.redirect(
        `/admin/item/show-detail-item/${itemId}`
      );
    }
  },
  editFeature: async (req, res) => {
    const { id, name, qty, itemId } = req.body;

    try {
      const updatedFeature = await Feature.findById(
        id
      );

      if (req.file !== undefined) {
        await fs.unlink(
          path.join(
            `public/${updatedFeature.imageUrl}`
          )
        );
        updatedFeature.imageUrl = `images/${req.file.filename}`;
      }

      updatedFeature.name = name;
      updatedFeature.qty = qty;

      await updatedFeature.save();

      req.flash(
        'alertMessage',
        'Selected Feature has been updated'
      );
      req.flash('alertStatus', 'success');
      res.redirect(
        `/admin/item/show-detail-item/${itemId}`
      );
    } catch (error) {
      req.flash('alertMessage', `${error.message}`);
      req.flash('alertStatus', 'danger');
      res.redirect(
        `/admin/item/show-detail-item/${itemId}`
      );
    }
  },
  // Booking
  viewBooking: (req, res) => {
    res.render('admin/booking/view_booking', {
      title: 'Stayseeker | Booking Status',
    });
  },
};
