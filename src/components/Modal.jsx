import { Dialog, Transition } from '@headlessui/react';
import { XCircleIcon } from '@heroicons/react/24/solid';
import React, { Fragment } from 'react';
import classNames from 'classnames';

/**
 * A flexible Modal component that can render either as a centered modal or a side panel.
 * It supports two types: 'basic' (default, centered) and 'side' (slides in from the right).
 * The component handles its own open/close transitions, supports dark mode, has a minimum width,
 * and adapts its width based on the children's content.
 *
 * @param {('basic'|'side')} [props.type='basic'] - The type of modal to render
 */
const Modal = ({
                 title,
                 isOpen,
                 children = <div />,
                 onClose = () => {},
                 type = 'basic'
               }) => {
  const isSideModal = type === 'side';

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        static
        className={classNames("fixed z-10 inset-0", {
          "overflow-y-auto": !isSideModal,
          "overflow-hidden": isSideModal
        })}
        open={isOpen}
        onClose={onClose}
      >
        <div className={classNames({
          "flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0": !isSideModal,
          "absolute inset-0 overflow-hidden": isSideModal
        })}>
          <Transition.Child
            as={Fragment}
            enter={isSideModal ? "ease-in-out duration-500" : "ease-out duration-300"}
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave={isSideModal ? "ease-in-out duration-500" : "ease-in duration-200"}
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          {!isSideModal && (
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>
          )}

          <Transition.Child
            as={Fragment}
            enter={isSideModal ? "transform transition ease-in-out duration-500 sm:duration-700" : "ease-out duration-300"}
            enterFrom={isSideModal ? "translate-x-full" : "opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"}
            enterTo={isSideModal ? "translate-x-0" : "opacity-100 translate-y-0 sm:scale-100"}
            leave={isSideModal ? "transform transition ease-in-out duration-500 sm:duration-700" : "ease-in duration-200"}
            leaveFrom={isSideModal ? "translate-x-0" : "opacity-100 translate-y-0 sm:scale-100"}
            leaveTo={isSideModal ? "translate-x-full" : "opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"}
          >
            {isSideModal ? (
              <div className="fixed inset-y-0 right-0 pl-10 flex">
                <div className="sm:w-auto sm:min-w-[320px]">
                  <div className="h-full flex flex-col bg-white shadow-xl overflow-y-scroll">
                    <div className="px-4 py-6 sm:px-6">
                      <div className="flex items-start justify-between">
                        {title && (
                          <span className="text-3xl text-gray-900 font-medium">
                            {title}
                          </span>
                        )}
                        <div className="ml-3 h-7 flex items-center">
                          <button
                            type="button"
                            className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            onClick={onClose}
                          >
                            <span className="sr-only">Close panel</span>
                            <XCircleIcon className="h-6 w-6" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="relative flex-1 px-4 sm:px-6">
                      {children}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:w-auto sm:min-w-[320px]">
                <div className="w-full">
                  <div className="relative">
                    <div className="absolute top-2 right-2">
                      <button type="button" onClick={onClose}>
                        <XCircleIcon
                          className="h-4 w-4 text-gray-600"
                          aria-hidden="true"
                          aria-label="close-icon"
                        />
                      </button>
                    </div>
                    {title && (
                      <Dialog.Title
                        as="h3"
                        className="text-lg leading-6 font-medium text-gray-900 p-6 pb-0"
                      >
                        {title}
                      </Dialog.Title>
                    )}
                    <div className="p-6">{children}</div>
                  </div>
                </div>
              </div>
            )}
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default Modal;