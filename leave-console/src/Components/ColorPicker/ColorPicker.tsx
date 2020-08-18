import React, { useState } from 'react'
import ReactDOM from 'react-dom'
import { ChromePicker } from 'react-color'
import classnames from 'classnames'

import { FormInputElement, Button, ButtonGroup } from '@skedulo/sked-ui'

import './ColorPicker.scss'

interface ColorPickerProps {
  colors: string[]
  selectedColor: string | null
  onColorSelect: (color: string) => void
  onNewColor: (color: string) => void
}

const ColorPicker: React.FC<ColorPickerProps> = ({
  colors,
  selectedColor,
  onColorSelect,
  onNewColor
}) => {
  const [isColorPickerOpened, setIsColorPickerOpened] = useState(false)
  const [customColor, setCustomColor] = useState('#008cff')
  const toggleColorPicker = () => setIsColorPickerOpened(!isColorPickerOpened)

  const handleCustomColorSubmit = () => {
    onNewColor(customColor)
    onColorSelect(customColor)
    toggleColorPicker()
  }

  return (
    <>
      <div className="colorpicker__colour-wrapper">
        <FormInputElement
          type="text"
          value={ selectedColor || '' }
          readOnly={ true }
          style={ {width: '95px'} }
          disabled={ true }
        />
        { colors.map(colour =>
          <div
            className={classnames('colorpicker__colour', { selected: selectedColor === colour })}
            style={ { backgroundColor: colour } }
            key={ colour }
            onClick={ () => onColorSelect(colour) }
          />)
        }
      </div>
      <div className={'colorpicker__colour-button'}>
        <Button buttonType="transparent" onClick={ () => toggleColorPicker() }>
          Custom colour
        </Button>
        { isColorPickerOpened && (
          ReactDOM.createPortal(
            <div className={ 'colorpicker__modal' }>
              <div className={ 'colorpicker__container' }>
                <h1 className={ 'colorpicker__title' }>Colour Picker</h1>
                <ChromePicker
                  disableAlpha={ true }
                  onChangeComplete={ (color: { hex: string }) => setCustomColor(color.hex) }
                  color={ customColor }
                />
<                 ButtonGroup>
                    <Button buttonType="transparent" onClick={ () => toggleColorPicker() }>
                      Cancel
                    </Button>
                    <Button
                      buttonType="primary"
                      onClick={ handleCustomColorSubmit }
                    >
                      Change
                    </Button>
                  </ButtonGroup>
              </div>
            </div>
          , document.body)
        ) }
      </div>
    </>
  )
}

export default ColorPicker
