const fs = require('fs-extra');
const path = require('path');
const bcrypt = require('bcryptjs');

const Category = require('../models/Category');
const Bank = require('../models/Bank');
const Item = require('../models/Item');
const Image = require('../models/Image');
const Feature = require('../models/Feature');
const Activity = require('../models/Activity');
const Users = require('../models/Users');
const Booking = require('../models/Booking');
const Member = require('../models/Member');

module.exports = {
  // Auth
  viewSignin: async (req, res) => {
    try {
      const alertMessage = req.flash('alertMessage');
      const alertStatus = req.flash('alertStatus');
      const alert = {
        message: alertMessage,
        status: alertStatus,
      };

      if (!req.session.user) {
        res.render('index', {
          alert,
          title: 'Stayseeker | Login',
        });
      } else {
        res.redirect('/admin/dashboard');
      }
    } catch (error) {
      res.redirect('/admin/signin');
    }
  },
  actionSignIn: async (req, res) => {
    try {
      const { username, password } = req.body;
      const selectedUser = await Users.findOne({
        username,
      });

      // Check user exist
      if (!selectedUser) {
        req.flash(
          'alertMessage',
          'User does not exist'
        );
        req.flash('alertStatus', 'danger');
        res.redirect('/admin/signin');
      }

      // Check password match
      const isPasswordMatch = await bcrypt.compare(
        password,
        selectedUser.password
      );

      if (!isPasswordMatch) {
        req.flash('alertMessage', 'Wrong password');
        req.flash('alertStatus', 'danger');
        res.redirect('/admin/signin');
      }

      req.session.user = {
        id: selectedUser.id,
        username: selectedUser.username,
      };
      res.redirect('/admin/dashboard');
    } catch (error) {
      req.flash('alertMessage', `${error.message}`);
      req.flash('alertStatus', 'danger');
      res.redirect('/admin/signin');
    }
  },
  actionLogout: (req, res) => {
    req.session.destroy();
    res.redirect('/admin/signin');
  },

  // Dashboard
  viewDashboard: async (req, res) => {
    try {
      const members = await Member.find();
      const bookings = await Booking.find();
      const items = await Item.find();
      const categories = await Category.find();

      res.render('admin/dashboard/view_dashboard', {
        title: 'Stayseeker | Dashboard',
        user: req.session.user,
        members,
        bookings,
        items,
        categories,
      });
    } catch (error) {
      res.redirect('/admin/dashboard');
    }
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
        user: req.session.user,
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
      await selectedCategory.save();

      req.flash(
        'alertMessage',
        'Selected category has been edited'
      );
      req.flash('alertStatus', 'success');
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
        user: req.session.user,
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
        user: req.session.user,
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
        user: req.session.user,
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
        user: req.session.user,
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
      const activities = await Activity.find({
        itemId,
      });

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
          activities,
          user: req.session.user,
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

  // Feature
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
  deleteFeature: async (req, res) => {
    const { id, itemId } = req.params;
    try {
      const deletedFeature = await Feature.findById(
        id
      );
      const relatedItem = await Item.findById(
        itemId
      ).populate('featureId');

      for (
        let i = 0;
        i < relatedItem.featureId.length;
        i++
      ) {
        if (
          relatedItem.featureId[i]._id.toString() ===
          deletedFeature._id.toString()
        ) {
          relatedItem.featureId.pull({
            _id: deletedFeature._id,
          });

          await relatedItem.save();
        }
      }

      await fs.unlink(
        path.join(`public/${deletedFeature.imageUrl}`)
      );
      await deletedFeature.remove();

      req.flash(
        'alertMessage',
        'Selected Feature has been deleted'
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

  // Activity
  addActivity: async (req, res) => {
    const { name, type, itemId } = req.body;

    try {
      if (!req.file) {
        req.flash('alertMessage', `Missing Image`);
        req.flash('alertStatus', 'danger');
        res.redirect(
          `/admin/item/show-detail-item/${itemId}`
        );
      }

      const newActivity = await Activity.create({
        name,
        type,
        itemId,
        imageUrl: `images/${req.file.filename}`,
      });

      const selectedItem = await Item.findById(itemId);
      selectedItem.activityId.push({
        _id: newActivity._id,
      });
      await selectedItem.save();

      req.flash(
        'alertMessage',
        'New Activity has been added'
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
  editActivity: async (req, res) => {
    const { id, name, type, itemId } = req.body;

    try {
      const updatedActivity = await Activity.findById(
        id
      );

      if (req.file) {
        await fs.unlink(
          path.join(
            `public/${updatedActivity.imageUrl}`
          )
        );
        updatedActivity.imageUrl = `images/${req.file.filename}`;
      }

      updatedActivity.name = name;
      updatedActivity.type = type;

      await updatedActivity.save();

      req.flash(
        'alertMessage',
        'Selected Activity has been updated'
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
  deleteActivity: async (req, res) => {
    const { id, itemId } = req.params;

    try {
      const deletedActivity = await Activity.findById(
        id
      );
      const relatedItem = await Item.findById(
        itemId
      ).populate('activityId');

      for (
        let i = 0;
        i < relatedItem.activityId.length;
        i++
      ) {
        if (
          relatedItem.activityId[i]._id.toString() ===
          deletedActivity._id.toString()
        ) {
          relatedItem.activityId.pull({
            _id: deletedActivity._id,
          });

          await relatedItem.save();
        }
      }

      await fs.unlink(
        path.join(`public/${deletedActivity.imageUrl}`)
      );
      await deletedActivity.remove();

      req.flash(
        'alertMessage',
        'Selected Activity has been deleted'
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
  viewBooking: async (req, res) => {
    try {
      const booking = await Booking.find()
        .populate('memberId')
        .populate('bankId');

      const alertMessage = req.flash('alertMessage');
      const alertStatus = req.flash('alertStatus');
      const alert = {
        message: alertMessage,
        status: alertStatus,
      };

      res.render('admin/booking/view_booking', {
        title: 'Stayseeker | Booking Status',
        user: req.session.user,
        booking,
        alert,
      });
    } catch (error) {
      res.redirect(`/admin/booking`);
    }
  },
  showDetailBooking: async (req, res) => {
    const { id } = req.params;
    try {
      const selectedBooking = await Booking.findById(
        id
      )
        .populate('memberId')
        .populate('bankId');

      res.render('admin/booking/show_detail_booking', {
        title: 'Stayseeker | Detail Booking',
        user: req.session.user,
        selectedBooking,
      });
    } catch (error) {
      res.redirect(`/admin/booking`);
    }
  },
  actionConfirmation: async (req, res) => {
    const { id } = req.params;
    try {
      const acceptedBooking = await Booking.findById(
        id
      );
      acceptedBooking.payments.status = 'Accepted';
      await acceptedBooking.save();

      req.flash(
        'alertMessage',
        'Selected Book has been confirmed'
      );
      req.flash('alertStatus', 'success');
      res.redirect(`/admin/booking`);
    } catch (error) {
      req.flash('alertMessage', `${error.message}`);
      req.flash('alertStatus', 'danger');
      res.redirect(`/admin/booking`);
    }
  },
  actionReject: async (req, res) => {
    const { id } = req.params;
    try {
      const acceptedBooking = await Booking.findById(
        id
      );
      acceptedBooking.payments.status = 'Rejected';
      await acceptedBooking.save();

      req.flash(
        'alertMessage',
        'Selected Book has been rejected'
      );
      req.flash('alertStatus', 'success');
      res.redirect(`/admin/booking`);
    } catch (error) {
      req.flash('alertMessage', `${error.message}`);
      req.flash('alertStatus', 'danger');
      res.redirect(`/admin/booking`);
    }
  },
};
