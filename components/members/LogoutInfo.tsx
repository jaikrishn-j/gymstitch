"use client"
import { useClerk } from '@clerk/nextjs'
import React from 'react'

type Props = {}

const LogoutInfo = (props: Props) => {
    const {signOut} = useClerk()
  return (
    <button onClick={()=>signOut({redirectUrl: '/login'})}>
        Sign out
    </button>
  )
}

export default LogoutInfo