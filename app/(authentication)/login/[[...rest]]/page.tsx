import { SignIn } from '@clerk/nextjs'
import React from 'react'
import { LoginForm } from './LoginForm'

type Props = {}

const page = (props: Props) => {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  )
}

export default page