import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Search, SlidersHorizontal } from 'lucide-react'
import React from 'react'

type Props = {}

const page = (props: Props) => {
  return (
    <div className='w-full'>
      <div className='mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8'>
        <div className='mb-6'>
          <h1 className='text-2xl font-semibold tracking-tight'>
            Payments
          </h1>

          <p className='mt-1 text-sm text-muted-foreground'>
            Manage payments
          </p>
        </div>

        {/* Payment section */}
        <div className='w-full space-y-4'>
          <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
            
            {/* Search */}

            <div className='relative w-full sm:max-w-sm'>
              <Search 
                className='
                  absolute
                  left-3
                  top-1/2
                  h-4 
                  w-4
                  -translate-y-1/2
                  text-muted-foreground
                '
              />

              <Input 
                placeholder='Search Plans...'
                className='pl-9'
              />
            </div>

            <div className='flex items-center gap-2'>
              
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

export default page