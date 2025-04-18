import React from 'react'

const Header = ( {title, subtitle}:{title:string, subtitle?:string}) => {
  return (
    <>
<h2 className='text-2xl font-bold text-gray-900 dark:text-black'>{title}</h2>
    {subtitle && <p className='text-sm text-gray-500 dark:text-gray-400'>{subtitle}</p>}
    </>
  )
}

export default Header