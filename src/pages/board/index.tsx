import React, { useMemo, useState, MouseEvent, TouchEvent } from 'react'
import { PaintBoard } from '@/utils/paintBoard'
import { CANVAS_ELE_TYPE } from '@/utils/constants'
import { useBackspace, useResizeEvent, useSpaceEvent } from '@/hooks/event'
import { CURSOR_TYPE } from '@/utils/cursor'
import { TextEdit } from '@/utils/element/text'

import ToolPanel from '@/components/toolPanel'
import Info from '@/components/info'
import CleanModal from '@/components/cleanModal'

const textEdit = new TextEdit()

const Board: React.FC = () => {
  // 初始化画板
  const [canvasRef, setCanvasRef] = useState<HTMLCanvasElement | null>(null)
  const board = useMemo(() => {
    if (canvasRef) {
      return new PaintBoard(canvasRef)
    }
  }, [canvasRef])

  // 工具类型
  const [toolType, setToolType] = useState<string>(CANVAS_ELE_TYPE.FREE_DRAW)

  const handleToolType = (type: string) => {
    if (board) {
      if (type !== CANVAS_ELE_TYPE.SELECT) {
        board.select.cancelSelectElement()
      }
      setToolType(type)
      board.render()
    }
  }

  // 是否按下空格
  const isPressSpace = useSpaceEvent(
    () => {
      if (board) {
        board.cursor.change(CURSOR_TYPE.POINTER)
        board.initOriginPosition()
      }
    },
    () => {
      if (board) {
        board.cursor.reset()
      }
    }
  )

  useResizeEvent(() => {
    if (board) {
      board.initCanvasSize()
      board.context.translate(board.originTranslate.x, board.originTranslate.y)
      board.render()
    }
  })

  useBackspace(() => {
    if (board) {
      board.select.deleteSelectElement()
    }
  })

  // 监听鼠标事件
  const [isMouseDown, setIsMouseDown] = useState<boolean>(false)
  const mouseDown = (event: MouseEvent) => {
    if (board) {
      const { clientX: x, clientY: y } = event
      const position = {
        x,
        y
      }
      // 如果有文本编辑框，取消编辑
      if (textEdit) {
        board.addTextElement(textEdit.value, textEdit.rect)
        textEdit.destroy()
      }
      switch (toolType) {
        case CANVAS_ELE_TYPE.SELECT:
          board.select.clickSelectElement(position)
          break
        case CANVAS_ELE_TYPE.FREE_DRAW:
        case CANVAS_ELE_TYPE.ERASER:
          if (!isPressSpace) {
            board.recordCurrent(toolType)
          }
          break
        default:
          break
      }
      setIsMouseDown(true)
    }
  }
  // TODO: improve solution
  const handleTouchStart = (event: TouchEvent<HTMLCanvasElement>) => {
    if (board) {
      const { clientX: x, clientY: y } = event.touches[0]
      const position = {
        x,
        y
      }
      if (textEdit) {
        board.addTextElement(textEdit.value, textEdit.rect)
        textEdit.destroy()
      }
      switch (toolType) {
        case CANVAS_ELE_TYPE.SELECT:
          board.select.clickSelectElement(position)
          break
        case CANVAS_ELE_TYPE.FREE_DRAW:
        case CANVAS_ELE_TYPE.ERASER:
          if (!isPressSpace) {
            board.recordCurrent(toolType)
          }
          break
        default:
          break
      }
      setIsMouseDown(true)
    }
  }

  const dbClick = (event: MouseEvent) => {
    if (board) {
      const { clientX: x, clientY: y } = event
      const position = {
        x,
        y
      }
      // 双击展示文字输入框
      textEdit.showTextInput(position)
    }
  }
  const mouseMove = (event: MouseEvent) => {
    if (board) {
      const { clientX: x, clientY: y } = event
      if (isPressSpace && isMouseDown) {
        board.dragCanvas({
          x,
          y
        })
      } else {
        switch (toolType) {
          case CANVAS_ELE_TYPE.SELECT:
            board.select.moveSelectElement({
              x,
              y
            })
            break
          case CANVAS_ELE_TYPE.FREE_DRAW:
          case CANVAS_ELE_TYPE.ERASER:
            if (isMouseDown) {
              console.log('draw')
              board.currentAddPosition({
                x,
                y
              })
            }
            break
          default:
            break
        }
      }
    }
  }
  // TODO: improve solution
  const handleTouchMove = (event: TouchEvent<HTMLCanvasElement>) => {
    console.log('TOUCH MOVE')
    console.log()
    const touch = event.touches[0]

    if (board) {
      const { clientX: x, clientY: y } = touch
      if (isPressSpace && isMouseDown) {
        board.dragCanvas({
          x,
          y
        })
      } else {
        switch (toolType) {
          case CANVAS_ELE_TYPE.SELECT:
            board.select.moveSelectElement({
              x,
              y
            })
            break
          case CANVAS_ELE_TYPE.FREE_DRAW:
          case CANVAS_ELE_TYPE.ERASER:
            if (isMouseDown) {
              console.log('draw')
              board.currentAddPosition({
                x,
                y
              })
            }
            break
          default:
            break
        }
      }
    }
  }
  const mouseUp = () => {
    if (board) {
      setIsMouseDown(false)
      board.canvasMouseUp()
    }
  }

  return (
    <div className="flex justify-center items-center flex-col w-screen h-screen">
      <ToolPanel
        board={board}
        toolType={toolType}
        setToolType={handleToolType}
      />
      <canvas
        className="touch-none"
        ref={setCanvasRef}
        onMouseDown={mouseDown}
        onTouchStart={handleTouchStart}
        onMouseMove={mouseMove}
        onMouseUp={mouseUp}
        onTouchMove={handleTouchMove}
        onDoubleClick={dbClick}
      ></canvas>
      <Info />
      <CleanModal board={board} />
    </div>
  )
}

export default Board
