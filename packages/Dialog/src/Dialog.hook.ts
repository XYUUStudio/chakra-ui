import { useAriaHidden, useIds, useLockBodyScroll } from "@chakra-ui/hooks"
import { callAllHandlers, mergeRefs } from "@chakra-ui/utils"
import * as React from "react"
import { useOutsideClick, useStackContext } from "./Dialog.utils"

export interface DialogHookProps {
  /**
   * If `true`, the modal when be opened.
   */
  isOpen: boolean
  /**
   * The `id` of the modal
   */
  id?: string
  /**
   * Callback invoked to close the modal.
   */
  onClose: (event?: MouseEvent | KeyboardEvent) => void
}

export function useDialog(props: DialogHookProps) {
  const { isOpen, onClose, id } = props
  const dialogRef = React.useRef<HTMLElement>(null)
  const overlayRef = React.useRef<HTMLElement>(null)

  const [dialogId, headerId, bodyId] = useIds(
    id,
    `chakra-dialog`,
    `chakra-dialog--header`,
    `chakra-dialog--body`,
  )

  useLockBodyScroll(dialogRef, isOpen)

  const modals = useStackContext(dialogRef, isOpen)
  useOutsideClick(dialogRef, overlayRef, modals, onClose)
  useAriaHidden(dialogRef, isOpen)

  const onKeyDown = React.useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation()
        onClose && onClose()
      }
    },
    [onClose],
  )

  const onOverlayClick = React.useCallback((event: React.MouseEvent) => {
    event.stopPropagation()
  }, [])

  const [headerMounted, setHeaderMounted] = React.useState(false)
  const [bodyMounted, setBodyMounted] = React.useState(false)

  type DialogContentProps = {
    ref?: React.Ref<any>
    onKeyDown?: React.KeyboardEventHandler
  }

  type DialogOverlayProps = {
    ref?: React.Ref<any>
    onClick?: React.MouseEventHandler
  }

  return {
    isOpen,
    onClose,
    headerId,
    bodyId,
    setBodyMounted,
    setHeaderMounted,
    getDialogContentProps: (props: DialogContentProps) => ({
      ...props,
      ref: mergeRefs(props.ref, dialogRef),
      id: dialogId,
      role: "dialog",
      tabIndex: 0,
      "aria-modal": true,
      "aria-labelledby": headerMounted ? headerId : undefined,
      "aria-describedby": bodyMounted ? bodyId : undefined,
      onKeyDown: callAllHandlers(props.onKeyDown, onKeyDown),
    }),
    getDialogOverlayProps: (props: DialogOverlayProps) => ({
      ...props,
      ref: mergeRefs(props.ref, overlayRef),
      role: "presentation",
      onClick: callAllHandlers(props.onClick, onOverlayClick),
    }),
  }
}

export type DialogHookReturn = ReturnType<typeof useDialog>
