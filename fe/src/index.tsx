import React from 'react'
import { render } from 'react-dom'
import UserScreen from './components/UserScreen'

const element = document.createElement('div')

render(
  <UserScreen
    name={'DevServer'}
  />, element)

document.body.appendChild(element)
