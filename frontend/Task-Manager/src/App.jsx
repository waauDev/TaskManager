import React from 'react'

import{
  BrowserRouter as Router, Routes, Route
} from "react-router-dom"
import Login from './pages/Auth/Login'
import SignUp from './pages/Auth/SignUp'
import Dashboard from './pages/Admin/Dashboard'
import ManageTask from './pages/Admin/ManageTask'
import CreateTask from './pages/Admin/CreateTask'
import ManageUser from './pages/Admin/ManageUser'
import UserDashboard from './pages/User/UserDashboard'
import MyTasks from './pages/User/MyTasks'
import ViewTaskDetail from './pages/User/ViewTaskDetail'
import PrivateRoute from './routes/PrivateRoute'


export const App = () => {
  return (
    <div>
      <Router>
        <Routes>
            <Route path='/login' element={<Login />}></Route>
            <Route path='/Signup' element={<SignUp />}></Route>

            {/*Admin Routes*/}
            <Route element={<PrivateRoute allowedRoles={["admin"]}/>} >
              <Route path="/admin/dashboard" element={<Dashboard/>}/>
              <Route path="/admin/tasks" element={<ManageTask/>}/>
              <Route path="/admin/create-task" element={<CreateTask/>}/>
              <Route path="/admin/users" element={<ManageUser/>}/>
            </Route>

             {/*user Routes*/}
            <Route element={<PrivateRoute allowedRoles={["admin"]}/>} >
              <Route path="/user/dashboard" element={<UserDashboard/>}/>
              <Route path="/user/tasks" element={<MyTasks/>}/>
              <Route path="/user/task-detail/:id" element={<ViewTaskDetail />}/>
            </Route>

        </Routes>
      </Router>
    </div>
  )
}


export default App