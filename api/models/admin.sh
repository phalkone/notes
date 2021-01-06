#!/bin/bash
set -e

mongo -u $MONGO_INITDB_ROOT_USERNAME -p $MONGO_INITDB_ROOT_PASSWORD<<EOF
db = db.getSiblingDB('admin')

db.createUser(
  {
    user: '$ADMIN_USER',
    pwd: '$ADMIN_PASSWORD',
    roles: [{ role: 'userAdminAnyDatabase', db: 'admin' }, 'readWriteAnyDatabase']
  }
)

db = db.getSiblingDB('notes')

db.createUser(
  {
    user: '$NOTES_USER',
    pwd: '$NOTES_PASSWORD',
    roles: [{ role: 'readWrite', db: 'notes' }]
  }
)
EOF