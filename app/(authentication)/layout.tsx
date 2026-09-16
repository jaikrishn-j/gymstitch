import { redirectByRole } from '@/utils/userRole'
import React from 'react'
import AuthFooter from './component/AuthFooter'


type Props = {
    children: React.ReactNode
}

const layout = async (props: Props) => {

  await redirectByRole("/", [], true);
  
  return (
     <div className="flex min-h-svh flex-col bg-muted/30">
      <main className="flex flex-1 items-center justify-center px-4 py-10">
        {props.children}
      </main>

      <AuthFooter />
    </div>
  )
}

export default layout