import React from 'react';
import styled from 'styled-components';

const GetCoords = (textArea: any) => {
  let replica = document.createElement("div");
  const copyStyle = getComputedStyle(textArea as Element);
  for (const prop of copyStyle) {
    replica.style[(prop as any)] = copyStyle[(prop as any)];
  }
  replica.style.height = "auto";
  replica.style.width = "auto";
  let span = document.createElement("span");
  replica.appendChild(span);

  let content = textArea.value.substr(0, textArea.selectionStart);
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
  const [startAt, setStartAt] = React.useState<number>(-1);
  const [position, setPosition] = React.useState<{ x: number, y: number }>({ x: -1, y: -1 });
  const [list, updateMentionList] = React.useState<Array<any>>(mentionList);
  const [mentionSize, setMentionSize] = React.useState<number>(0);
  const [index, setIndex] = React.useState<number>(-1);

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
      if (startAt > -1 && list.length > 0) {
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
            handleMentionInsert(list[index][field]);
            setIndex(-1);
            event.preventDefault();
            break;
          default:
            break;
        }
      }
    }

    function handleMouseMoveOverDropdown(event: MouseEvent) {
      (startAt > -1) && (list.length > 0) && (index > -1) && DropdownRef.current && DropdownRef.current!.contains(event.target) && setIndex(-1);
    }

    document.addEventListener('keydown', handleArrowKeyDown);
    document.addEventListener('mousemove', handleMouseMoveOverDropdown);
    return () => {
      document.removeEventListener('keydown', handleArrowKeyDown);
      document.removeEventListener('mousemove', handleMouseMoveOverDropdown);
    }
  }, [startAt, list, index]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const start = e.target.selectionStart;
    const character = value.substring(start - 1, start);

    onChange && onChange(value);

    if (character === symbol) {
      setStartAt(start);
      const coord = GetCoords(ParentRef.current);
      setPosition(coord);
      return;
    }

    if (character === " " || character === '\n' || character === '\r' || value.trim() === "") {
      setStartAt(-1);
      return;
    }
    setPosition(GetCoords(ParentRef.current));

    if (startAt > -1) {
      setMentionSize(start - startAt);
      const mention = value.substring(startAt, start);
      const updatedList = mentionList.filter( x => (x[field] as string).substring(0, start - startAt) === mention );
      updateMentionList(updatedList);
    }
  }

  const handleMentionInsert = (value: string) => {
    const textArea = ParentRef.current!;
    const first = textArea.value.substr(0, startAt);
    const last = textArea.value.substr(
      startAt + mentionSize,
      textArea.value.length
    );
    const content = `${first}${value}${last}`;
    textArea.value = content;
    setMentionSize(value.length);
    textArea.focus();
    if (onChange) onChange(textArea.value);
    setStartAt(-1);
    setMentionSize(0);
  }

  return (
    <Container>
      <Dropdown
        className='tt-menu'
        open={startAt > -1 && list.length > 0}
        x={position.x}
        y={position.y}
        ref={DropdownRef}
      >
          {list.map((mention, i) => {
            return (
              <div
                key={i}
                className={`tt-suggestion tt-selectable${index === i ? ' tt-cursor': ''}`}
                onClick={() => handleMentionInsert(mention[field])}
              >
                {renderMentionItem ? (
                  renderMentionItem(mention)
                ) : (
                  <div>{mention[field]}</div>
                )}
              </div>
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
  margin-top: 7px !important;
  display: ${props => props.open ? 'block' : 'none'};
`

export default MentionInput;
