const express = require("express")
const app = express()


const AdminBro = require('admin-bro');
const AdminBroMongoose = require('admin-bro-mongoose');
const AdminBroExpress = require('@admin-bro/express');



const Student = require("./models/Student")
const Faculty = require('./models/Faculty')


AdminBro.registerAdapter(AdminBroMongoose);


const admin = new AdminBro({
  resources: [Student,Faculty],
  rootPath: '/admin',
});

const router = AdminBroExpress.buildRouter(admin);

app.use(admin.options.rootPath, router);