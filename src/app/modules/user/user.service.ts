/* eslint-disable @typescript-eslint/no-explicit-any */

import config from '../../config';
import { TAdmin } from '../Admin/admin.interface';
import { Admin } from '../Admin/admin.model';
import { TUser } from './user.interface';
import { User } from './user.model';



const createAdminIntoDB = async (file:any,password: string, payload: TAdmin) => {
  // create a user object
  const userData: Partial<TUser> = {};

  //if password is not given , use deafult password
  userData.password = password || (config.default_password as string);

  //set student role
  userData.role = 'admin';
  userData.email = payload.email;



};
const getMe = async (userId:string,role:string) => {
  
  let result = null
 
  if (role === "admin") {
    result=await Admin.findOne({id:userId}).populate('user')
  }



return result
}
const changeStatus = async (id: string, payload: { status: string }) => {
  const result = await User.findByIdAndUpdate(id, payload, {
    new:true
  })
  return result
}

export const UserServices = {

  createAdminIntoDB,
  getMe,
  changeStatus
};
