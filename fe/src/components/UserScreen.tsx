import React from 'react'
import '../style/UserScreen.css'

interface ILoginScreen {
  name: string
}

export default function Welcome (props: ILoginScreen) {
  return (
    <div>{props.name}</div>
  )
}
