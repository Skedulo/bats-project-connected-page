import * as React from 'react'
import { createPortal } from 'react-dom'

export const DROPDOWN_DOM_ID = 'dropdown-root'
const CONTAINER_CLASS = 'sked-portal-dropdown'
const CONTENT_CLASS = 'sked-portal-dropdown__content'

export const notTargetAreas = (elements: (Element | HTMLElement)[], e: MouseEvent) => {
  const target = e.target as Node
  return elements.every(element => !element || (target !== element && !element.contains(target)))
}

interface PortalDropDownProps {
  trigger: Element
  className?: string
  onPageScroll?: () => void
  preventAutoPosition?: boolean
}

export const overflowsViewportHeight = (elementRect: ClientRect) => {
  return elementRect.bottom >= window.innerHeight
}

export class PortalDropDown extends React.Component<PortalDropDownProps, {}> {
  private _dropDownRoot = document.getElementById('root')

  private _container = document.createElement('div')

  // @ts-ignore
  private _content: HTMLDivElement

  componentDidMount() {
    this._container.className = CONTAINER_CLASS
    // @ts-ignore
    document.addEventListener('scroll', this.handleScroll, true)
    window.addEventListener('resize', this.handleResize)
    // @ts-ignore
    if (this._dropDownRoot) {
      this._dropDownRoot.appendChild(this._container)
    }
    this.positionToFit()
  }

  componentDidUpdate() {
    this.positionToFit()
  }

  componentWillUnmount() {
    // @ts-ignore
    document.removeEventListener('scroll', this.handleScroll, true)
    window.removeEventListener('resize', this.handleResize)
    // @ts-ignore
    if (this._dropDownRoot) {
      this._dropDownRoot.removeChild(this._container)
    }
  }

  // By default the drop down will be on the bottom, but if the content will extend past
  // the bottom of the viewport, we position it above the trigger
  positionToFit() {
    const content = this._content.getBoundingClientRect()
    if (overflowsViewportHeight(content) && !this.props.preventAutoPosition) {
      this._container.style.top = `${this.props.trigger.getBoundingClientRect().top - content.height}px`
      this._content.classList.add(`${CONTENT_CLASS}--top`)
      return
    }
    this._content.classList.remove(`${CONTENT_CLASS}--top`)
  }

  handleScroll = (e: MouseEvent) => {
    if (notTargetAreas([this.props.trigger, this._content], e)) {
      if (this.props.onPageScroll) {
        this.props.onPageScroll()
        return
      }

      const trigger = this.props.trigger.getBoundingClientRect()
      this._container.style.top = `${trigger.bottom + window.scrollY}px`
      this.positionToFit()
    }
  }

  handleResize = () => {
    this.setContainerPosition()
  }

  setRef = (div: HTMLDivElement) => {
    this._content = div
  }

  setContainerPosition() {
    const { trigger } = this.props
    const triggerCoords = trigger.getBoundingClientRect()
    this._container.style.top = `${triggerCoords.bottom}px`
    this._container.style.left = `${triggerCoords.left}px`
    this._container.style.width = `${triggerCoords.width}px`
  }

  renderDropdown() {
    const { className } = this.props
    this.setContainerPosition()
    return (
      <div
        className={`${className} ${CONTENT_CLASS}`}
        ref={this.setRef}
        data-sk-name="autocomplete-content"
      >
        {this.props.children}
      </div>
    )
  }

  render() {
    return createPortal(this.renderDropdown(), this._container)
  }
}
