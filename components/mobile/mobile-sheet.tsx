'use client'

import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react'
import { X } from 'lucide-react'

interface MobileSheetProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  footer?: React.ReactNode
}

export function MobileSheet({ open, onClose, title, children, footer }: MobileSheetProps) {
  return (
    <Transition show={open}>
      <Dialog onClose={onClose} className="relative z-[60]">
        {/* Backdrop */}
        <TransitionChild
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50" />
        </TransitionChild>

        {/* Sheet */}
        <div className="fixed inset-0 flex items-end">
          <TransitionChild
            enter="ease-out duration-300"
            enterFrom="translate-y-full"
            enterTo="translate-y-0"
            leave="ease-in duration-200"
            leaveFrom="translate-y-0"
            leaveTo="translate-y-full"
          >
            <DialogPanel className="w-full max-h-[90vh] overflow-hidden rounded-t-2xl bg-white shadow-xl">
              {/* Drag handle */}
              <div className="flex justify-center py-2">
                <div className="h-1 w-10 rounded-full bg-gray-300" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-4 pb-3">
                <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
                <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-gray-100" aria-label="Đóng">
                  <X size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="overflow-y-auto px-4 pb-4" style={{ maxHeight: 'calc(90vh - 120px)' }}>
                {children}
              </div>

              {/* Footer */}
              {footer && (
                <div className="border-t px-4 py-3">
                  {footer}
                </div>
              )}
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  )
}
