import React from 'react'

function DashboardListPage() {
    return (
        <div className='h-list-screen overflow-y-auto w-full'>
            <div className='flex flex-col gap-3 p-3'>
                <button className='items-center p-3 border border-gray-200 rounded-md w-full grid grid-cols-3 gap-2 hover:bg-gray-100'>
                    <div className='col-span-2 text-left'>
                        <div className='font-bold'>Team Dashboard</div>
                    </div>
                </button>

                <button className='items-center p-3 border border-gray-200 rounded-md w-full grid grid-cols-3 gap-2 hover:bg-gray-100'>
                    <div className='col-span-2 text-left'>
                        <div className='font-bold'>Project Dashboard</div>
                    </div>
                </button>
            </div>
        </div>
    )
}

export default DashboardListPage;