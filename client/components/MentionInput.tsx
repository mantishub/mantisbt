import React from 'react';
import styled from 'styled-components';

const GetCoords = (textArea: any, index: number) => {
  let replica = document.createElement("div");
  const copyStyle = getComputedStyle(textArea as Element);
  for (const prop of copyStyle) {
    replica.style[(prop as any)] = copyStyle[(prop as any)];
  }
  replica.style.height = "auto";
  replica.style.width = "auto";
  let span = document.createElement("span");
  replica.appendChild(span);

  let content = textArea.value.substr(0, index);
  let contentLines = content.split(/[\n\r]/g);
  let currentline = content.substr(0, content.selectionStart).split(/[\n\r]/g).length;
  let replicaContent = "";

  contentLines.map((l: any, i: any) => {
    if (i === currentline - 1 && i < contentLines.length) {
      replicaContent += contentLines[i];
      return l;
    }
    replicaContent += "\n";
  });
  span.innerHTML = replicaContent.replace(/\n$/, "\n^A");
  document.body.appendChild(replica);
  const { offsetWidth: spanWidth, offsetHeight: spanHeight } = span;
  document.body.removeChild(replica);

  return {
    x: (spanWidth > textArea.offsetWidth ? textArea.offsetWidth : spanWidth) + textArea.offsetLeft,
    y: (spanHeight > textArea.offsetHeight ? textArea.offsetHeight: spanHeight) + textArea.offsetTop
  };
};

interface Props {
  symbol?: string;
  field?: string;
  secondaryField?: string;
  mentionList: Array<any>;
  fieldId: string;
  fieldStyle?: string;
  fieldRows?: number;
  fieldCols?: number;
  fieldName?: string;
  value: string;
  onChange?: (value: string) => void;
  renderMentionItem?: (item: any) => React.ReactNode;
}

const MentionInput: React.FC<Props> = ({
  symbol = '@',
  field = 'name',
  secondaryField,
  mentionList,
  onChange,
  renderMentionItem,
  fieldStyle = 'form-control',
  fieldId,
  fieldRows = 7,
  fieldCols = 80,
  fieldName = '',
  value,
}: Props) => {
  const ParentRef = React.useRef<HTMLTextAreaElement>(null);
  const DropdownRef = React.useRef<any>(null);
  const [position, setPosition] = React.useState<{ x: number, y: number }>({ x: -1, y: -1 });
  const [list, updateMentionList] = React.useState<Array<any>>(mentionList);
  const [mentionSize, setMentionSize] = React.useState<number>(0);
  const [index, setIndex] = React.useState<number>(0);
  const [expanded, setExpanded] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (ParentRef) {
      ParentRef.current!.value = value;
    }
  }, [ value, ParentRef ]);

  React.useEffect(() => {
    function handleClickOutSide(event: MouseEvent) {
      if (DropdownRef.current && !DropdownRef.current!.contains(event.target)) {
        updateMentionList([]);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutSide);
    return () => {
      document.removeEventListener('mousedown', handleClickOutSide);
    }
  }, [DropdownRef]);
  
  React.useEffect(() => {
    function handleArrowKeyDown(event: KeyboardEvent) {
      if (expanded && list.length > 0) {
        switch(event.key) {
          case 'ArrowDown':
            event.preventDefault();
            if (index < list.length - 1) setIndex(index + 1);
            break;
          case 'ArrowUp':
            event.preventDefault();
            if (index > 0) setIndex(index - 1);
            break;
          case 'Enter':
          case 'Tab':
            handleMentionInsert(list[index][field]);
            setIndex(0);
            event.preventDefault();
            break;
          default:
            break;
        }
      }
    }

    document.addEventListener('keydown', handleArrowKeyDown);
    return () => {
      document.removeEventListener('keydown', handleArrowKeyDown);
    }
  }, [expanded, list, index]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const start = e.target.selectionStart;
    const character = value.substring(start - 1, start);

    onChange && onChange(value);

    const prevValue = value.substring(0, start);
    let startPos = prevValue.lastIndexOf(`${symbol}`);
    if (startPos > -1 && 
        (prevValue[startPos - 1] === '' ||
         prevValue[startPos - 1] === '\n' ||
         prevValue[startPos - 1] === '\r' ||
         prevValue[startPos - 1] === ' ' ||
         prevValue[startPos - 1] === undefined)) startPos += symbol.length;
    
    if (startPos > -1 && !expanded) {
      setExpanded(true);
      const coord = GetCoords(ParentRef.current, startPos);
      setPosition(coord);
    }

    if (character === '\n' || character === '\r' || value.trim() === '') {
      setExpanded(false);
      return;
    }

    if (startPos > -1) {
      setMentionSize(start - startPos);
      const mention = value.substring(startPos, start).toLowerCase();
      const updatedList = mentionList.filter( x => (x[field] as string).substring(0, start - startPos).toLowerCase() === mention );
      updateMentionList(updatedList);

      !updatedList.length && setExpanded(false);
    }
  }

  const handleMentionInsert = (value: string) => {
    const textArea = ParentRef.current!;
    const startPos = textArea.value.substring(0, textArea.selectionStart).lastIndexOf(`${symbol}`) + symbol.length;
    const first = textArea.value.substr(0, startPos);
    const last = textArea.value.substr(
      startPos + mentionSize,
      textArea.value.length
    );
    const content = `${first}${value} ${last}`;
    textArea.value = content;
    setMentionSize(value.length);
    textArea.focus();
    if (onChange) onChange(textArea.value);
    updateMentionList([]);
    setMentionSize(0);
    setExpanded(false);
  }

  return (
    <Container>
      <Dropdown
        className='tt-menu'
        open={expanded && list.length > 0}
        x={position.x}
        y={position.y}
        ref={DropdownRef}
      >
          {list.map((mention, i) => {
            return (
              <Item
                key={i}
                className={`tt-suggestion tt-selectable${index === i ? ' tt-cursor': ''}`}
                onClick={() => handleMentionInsert(mention[field])}
              >
                {renderMentionItem ? (
                  renderMentionItem(mention)
                ) : (
                  <React.Fragment>
                    <span>{mention[field]}</span>
                    {secondaryField ? <small>{mention[secondaryField]}</small> : null}
                  </React.Fragment>
                )}
              </Item>
            )
          })}
      </Dropdown>
      <textarea
        id={fieldId}
        name={fieldName}
        className={fieldStyle}
        rows={fieldRows}
        cols={fieldCols}
        ref={ParentRef}
        onChange={handleTextChange}
        />
    </Container>
  );
};

const Container = styled.div`
  position: relative;
`

const Dropdown = styled.div<{open: boolean,x: number,y: number}>`
  position: absolute;
  top: ${props => props.y}px !important;
  left: ${props => props.x}px !important;
  right: auto !important;
  margin-left: 10px;
  margin-top: 7px !important;
  padding: 0px !important;
  border-radius: 5px;
  overflow: hidden;
  display: ${props => props.open ? 'block' : 'none'};
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

export default MentionInput;
