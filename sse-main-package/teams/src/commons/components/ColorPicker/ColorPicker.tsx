import React, { useState } from 'react'
import classnames from 'classnames'
import { ChromePicker } from 'react-color'

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
    <div className="ColorPicker">
      <div className="ColorPicker-input">
        <FormInputElement
          type="text"
          value={selectedColor || ''}
          readOnly={true}
          disabled={true}
        />
        {colors.map(colour =>
          <div
            className={classnames('colour', {
              selected: selectedColor === colour
            })}
            style={ { backgroundColor: colour } }
            key={ colour }
            onClick={ () => onColorSelect(colour) }
          />)
        }
      </div>
      <div>
        <Button buttonType="transparent" onClick={toggleColorPicker}>
          Custom colour
        </Button>
        {isColorPickerOpened && (
          <div className="ColorPicker-modal cx-shadow">
            <div className="">
              <h1 className="cx-text-sm cx-mb-2 cx-font-semibold">Colour Picker</h1>
              <ChromePicker
                disableAlpha={ true }
                onChangeComplete={ (color: { hex: string }) => setCustomColor(color.hex) }
                color={ customColor }
              />
              <div className="cx-text-right cx-mt-1">
                <ButtonGroup>
                  <Button buttonType="transparent" onClick={toggleColorPicker}>
                    Cancel
                  </Button>
                  <Button
                    buttonType="primary"
                    onClick={handleCustomColorSubmit}
                  >
                    Change
                  </Button>
                </ButtonGroup>
              </div>
            </div>
          </div>
        ) }
      </div>
    </div>
  )
}

export default ColorPicker
