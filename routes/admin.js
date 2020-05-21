const router = require('express').Router();
const adminController = require('../controllers/adminController');
const {
  uploadSingle,
  uploadMulti,
} = require('../middleware/multer');
const auth = require('../middleware/auth');

router.get('/signin', adminController.viewSignin);
router.post('/signin', adminController.actionSignIn);
router.use(auth);
router.get('/logout', adminController.actionLogout);
router.get(
  '/dashboard',
  adminController.viewDashboard
);
// Category
router.get('/category', adminController.viewCategory);
router.post('/category', adminController.addCategory);
router.put('/category', adminController.editCategory);
router.delete(
  '/category/:id',
  adminController.deleteCategory
);
// Bank
router.get('/bank', adminController.viewBank);
router.post(
  '/bank',
  uploadSingle,
  adminController.addBank
);
router.put(
  '/bank',
  uploadSingle,
  adminController.editBank
);
router.delete('/bank/:id', adminController.deleteBank);
// Item
router.get('/item', adminController.viewItem);
router.post(
  '/item',
  uploadMulti,
  adminController.addItem
);
router.get(
  '/item/show-image/:id',
  adminController.showImageItem
);
router.get('/item/:id', adminController.showEditItem);
router.put(
  '/item/:id',
  uploadMulti,
  adminController.editItem
);
router.delete('/item/:id', adminController.deleteItem);
// Detail Item
router.get(
  '/item/show-detail-item/:itemId',
  adminController.viewDetailItem
);
// Feature
router.post(
  '/item/add/feature',
  uploadSingle,
  adminController.addFeature
);
router.put(
  '/item/update/feature',
  uploadSingle,
  adminController.editFeature
);
router.delete(
  '/item/:itemId/feature/:id',
  adminController.deleteFeature
);
// Activity
router.post(
  '/item/add/activity',
  uploadSingle,
  adminController.addActivity
);
router.put(
  '/item/update/activity',
  uploadSingle,
  adminController.editActivity
);
router.delete(
  '/item/:itemId/activity/:id',
  adminController.deleteActivity
);
// Booking
router.get('/booking', adminController.viewBooking);
router.get(
  '/booking/:id',
  adminController.showDetailBooking
);
router.put(
  '/booking/:id/confirmation',
  adminController.actionConfirmation
);
router.put(
  '/booking/:id/reject',
  adminController.actionReject
);

module.exports = router;
