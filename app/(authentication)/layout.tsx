import { redirectByRole } from '@/utils/userRole'
import React from 'react'


type Props = {
    children: React.ReactNode
}

const layout = async (props: Props) => {

  await redirectByRole("/", [], true);
  
  return (
    <div className='flex w-full h-screen items-center justify-center'>
      {props.children}
    </div>
  )
}

export default layout