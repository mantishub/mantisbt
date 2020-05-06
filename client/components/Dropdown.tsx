import React from 'react';
import styled from 'styled-components';

interface Props {
  expanded: boolean;
  position?: {x: number, y: number};
  options: Array<any>;
  maxLimit?: number;
  renderItem: (item: any) => React.ReactNode;
  onSelectItem: (item: any) => void;
  onHide: () => void;
}

const Dropdown: React.FC<Props> = ({
  expanded,
  options,
  position,
  renderItem,
  onSelectItem,
  onHide,
  maxLimit = 5,
}: Props) => {
  const [index, setIndex] = React.useState<number>(0);
  const [hiddenCnt, setHiddenCount] = React.useState<number>(0);
  const DropdownRef = React.useRef<any>(null);

  React.useEffect(() => {
    setIndex(0);
    setHiddenCount(0);
  }, [options]);

  React.useEffect(() => {
    function handleClickOutSide(event: MouseEvent) {
      if (DropdownRef.current && !DropdownRef.current!.contains(event.target) && document.body.contains(event.target as any)) {
        onHide();
      }
    }
    
    document.addEventListener('mousedown', handleClickOutSide);
    return () => {
      document.removeEventListener('mousedown', handleClickOutSide);
    }
  }, [DropdownRef]);
  
  React.useEffect(() => {
    function handleArrowKeyDown(event: KeyboardEvent) {
      if (expanded && options.length > 0) {
        let _index = index;
        switch(event.key) {
          case 'ArrowDown':
            event.preventDefault();
            if (index < options.length - 1) _index ++;
            if (_index >= hiddenCnt + maxLimit) setHiddenCount(hiddenCnt + 1);
            break;
          case 'ArrowUp':
            event.preventDefault();
            if (index > 0) _index --;
            if (_index < hiddenCnt) setHiddenCount(hiddenCnt - 1);
            break;
          case 'Enter':
          case 'Tab':
            onSelectItem(options[index]);
            _index = 0;
            setHiddenCount(0);
            event.preventDefault();
            break;
          case 'Escape':
            event.preventDefault();
            onHide();
            break;
          default:
            break;
        }
        setIndex(_index);
      }
    }

    document.addEventListener('keydown', handleArrowKeyDown);
    return () => {
      document.removeEventListener('keydown', handleArrowKeyDown);
    }
  }, [expanded, options, index]);
  return (
    <Container
      className='tt-menu'
      open={expanded}
      ref={DropdownRef}
      x={position ? position.x : undefined}
      y={position ? position.y : undefined}
      max={maxLimit}
    >
      {options.slice(hiddenCnt, hiddenCnt + maxLimit).map((option, _index) => (
          <Item
            key={_index}
            className={`tt-suggestion tt-selectable${index - hiddenCnt === _index ? ' tt-cursor': ''}`}
            onClick={() => {
              onSelectItem(option);
              setIndex(0);
              setHiddenCount(0);
            }}
          >
            {renderItem(option)}
          </Item>
        ))}
    </Container>
  )
}

const Container = styled.div<{open: boolean,x?: number,y?: number, max: number}>`
  position: absolute;
  top: ${props => props.y ? props.y + 'px' : '100%'} !important;
  left: ${props => props.x ? props.x : 0}px !important;
  right: auto !important;
  margin-top: 7px !important;
  padding: 0px !important;
  border-radius: 5px;
  overflow: hidden;
  width: fit-content !important;
  display: ${props => props.open ? 'block' : 'none'};
  max-height: ${props => props.max * 32}px;
`

const Item = styled.div`
  border-bottom: 1px solid #e1e4e8;
  font-size: 14px;
  & small {
    color: #586069;
    margin-left: 5px;
  }
  &.tt-cursor small {
    color: white !important;
  }
  &:hover small {
    color: white !important;
  }
  &:last-child {
    border-bottom: 0px !important;
  }
`

export default Dropdown;
