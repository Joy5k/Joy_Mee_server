import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { UserServices } from './user.service';




const createAdmin = catchAsync(async (req, res) => {
  const { password, admin: adminData } = req.body;

  const result = await UserServices.createAdminIntoDB(req.file,password, adminData);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Admin is created successfully',
    data: result,
  });
});
const getMe = catchAsync(async (req, res) => {
  // }
const {userId,role}=req.user//getting the user data after its verified check the module-19.8 if you have any dought
  const result = await UserServices.getMe(userId,role);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'user retrieve successfully',
    data: result,
  });
});
const changeStatus = catchAsync(async (req, res) => {
  const id = req.params.id
  const result=await UserServices.changeStatus(id,req.body)
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'user retrieve successfully',
    data: result,
  });
});

export const UserControllers = {

  createAdmin,
  getMe,
  changeStatus
};
