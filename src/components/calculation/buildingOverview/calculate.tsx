import React from 'react'
import { AccordionRoot, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'
import { CirclePlusIcon, CircleMinusIcon } from '@/components/shared/icons'

// Mejorar el tipo de renderObject para aceptar objetos o arrays genéricos
const renderObject = (obj: unknown) => {
  if (typeof obj !== 'object' || obj === null) {
    return <span>{String(obj)}</span>;
  }
  if (Array.isArray(obj)) {
    return (
      <div className="space-y-2">
        {obj.map((item, idx) => (
          <div key={idx} className="border-b pb-2">
            {renderObject(item)}
          </div>
        ))}
      </div>
    );
  }
  // obj es un objeto
  return (
    <div className="divide-y">
      {Object.entries(obj as Record<string, unknown>).map(([key, value]) => (
        <div key={key} className="flex py-1">
          <div className="w-1/2 font-semibold text-left pr-2">{key}</div>
          <div className="w-1/2 text-right break-all">{renderObject(value)}</div>
        </div>
      ))}
    </div>
  );
};

const Calculate = ({ pluto, ll84 }: { pluto: unknown; ll84: unknown }) => {
  return (
    <div className="flex flex-col gap-4 pt-8">
      <AccordionRoot className='rounded-[5px] border border-stroke shadow-lg dark:border-dark-3 dark:shadow-card w-full bg-white dark:bg-dark-1'>
        <AccordionItem>
        <AccordionTrigger className="group flex w-full flex-wrap items-center justify-between gap-2 px-4 py-6 data-[state=open]:pb-5 md:px-6 xl:pl-7.5">
              <span className="text-lg font-bold text-dark dark:text-white sm:text-heading-6">
                PLUTO and LL84 Raw Data
              </span>

              <div className="text-primary dark:text-white">
                <CirclePlusIcon className="group-data-[state=open]:hidden" />
                <CircleMinusIcon className="group-data-[state=closed]:hidden" />
              </div>
            </AccordionTrigger>
          <AccordionContent className='p-4 md:p-8'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='bg-white dark:bg-dark-1 rounded-[5px] border border-stroke shadow-card-3 dark:border-dark-3 dark:shadow-card p-4 md:p-8'>
                <h2 className='text-lg font-bold mb-4'>Pluto</h2>
                {renderObject(pluto)}
              </div>
              <div className='bg-white dark:bg-dark-1 rounded-[5px] border border-stroke shadow-card-3 dark:border-dark-3 dark:shadow-card p-8'>
                <h2 className='text-lg font-bold mb-4'>LL84</h2>
                {renderObject(ll84)}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </AccordionRoot>
    </div>
  )
}

export default Calculate
