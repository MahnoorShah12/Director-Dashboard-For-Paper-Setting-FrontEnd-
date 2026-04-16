// src/main/config/Api.js

// const BASE_URL="";
// export default BASE_URL




export const BASE_URL = 'http://192.168.31.125/fypProject/api';


export const API = {
  // Login
  login: '/auth/login',

  // Faculty
  getTeachers: '/faculty/get_teachers',
  searchTeacher: '/faculty/search_teacher',
  addTeacher: '/faculty/add-teacher',
  deleteTeacher: '/faculty/delete_teacher',
  editTeacher:'/faculty/edit_teacher_data',

  // Agar future mein HOD ya DataCell endpoints bhi add karni ho
  // Example:
  // getHOD: '/hod/get_hods',
  // addHOD: '/hod/add-hod',
};
