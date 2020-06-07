import * as CSS from "csstype";
import * as PropTypes from "prop-types";

type NativeAnimationEvent = AnimationEvent;
type NativeClipboardEvent = ClipboardEvent;
type NativeCompositionEvent = CompositionEvent;
type NativeDragEvent = DragEvent;
type NativeFocusEvent = FocusEvent;
type NativeKeyboardEvent = KeyboardEvent;
type NativeMouseEvent = MouseEvent;
type NativeTouchEvent = TouchEvent;
type NativePointerEvent = PointerEvent;
type NativeTransitionEvent = TransitionEvent;
type NativeUIEvent = UIEvent;
type NativeWheelEvent = WheelEvent;
type Booleanish = boolean | "true" | "false";

export namespace Ginny {
  //
  // Ginny Elements
  // ----------------------------------------------------------------------
  type Key = string | number;

  /**
   * @internal You shouldn't need to use this type since you never see these attributes
   * inside your component or have to validate them.
   */
  export interface Attributes {
    key?: Key;
  }

  // GinnyHTML for GinnyHTMLElement
  // tslint:disable-next-line:no-empty-interface
  export interface GinnyHTMLElement<T extends HTMLElement> {
    props: AllHTMLAttributes<T>;
  }

  // GinnySVG for GinnySVGElement
  export interface GinnySVGElement {
    type: keyof GinnySVG;
    props: SVGAttributes<SVGElement>;
  }

  export interface Node {
    type: "element" | "text";
    text: string;
  }

  export type OutputType = Node | string | Promise<Node> | Promise<string>;

  type DOMFactory<P extends DOMAttributes<T>, T extends Element> = (
    props?: (Attributes & P) | null,
    ...children: OutputType[]
  ) => string;

  interface DetailedHTMLFactory<P extends HTMLAttributes<T>, T extends HTMLElement> extends DOMFactory<P, T> {
    (props?: (Attributes & P) | null, ...children: OutputType[]): OutputType;
  }

  interface SVGFactory extends DOMFactory<SVGAttributes<SVGElement>, SVGElement> {
    (props?: (Attributes & SVGAttributes<SVGElement>) | null, ...children: OutputType[]): GinnySVGElement;
  }

  //
  // Event System
  // ----------------------------------------------------------------------
  // TODO: change any to unknown when moving to TS v3
  interface BaseSyntheticEvent<E = object, C = any, T = any> {
    nativeEvent: E;
    currentTarget: C;
    target: T;
    bubbles: boolean;
    cancelable: boolean;
    defaultPrevented: boolean;
    eventPhase: number;
    isTrusted: boolean;
    preventDefault(): void;
    isDefaultPrevented(): boolean;
    stopPropagation(): void;
    isPropagationStopped(): boolean;
    persist(): void;
    timeStamp: number;
    type: string;
  }

  /**
   * currentTarget - a reference to the element on which the event listener is registered.
   *
   * target - a reference to the element from which the event was originally dispatched.
   * This might be a child element to the element on which the event listener is registered.
   * If you thought this should be `EventTarget & T`, see https://github.com/DefinitelyTyped/DefinitelyTyped/pull/12239
   */
  interface SyntheticEvent<T = Element, E = Event> extends BaseSyntheticEvent<E, EventTarget & T, EventTarget> {}

  interface ClipboardEvent<T = Element> extends SyntheticEvent<T, NativeClipboardEvent> {
    clipboardData: DataTransfer;
  }

  interface CompositionEvent<T = Element> extends SyntheticEvent<T, NativeCompositionEvent> {
    data: string;
  }

  interface DragEvent<T = Element> extends MouseEvent<T, NativeDragEvent> {
    dataTransfer: DataTransfer;
  }

  interface PointerEvent<T = Element> extends MouseEvent<T, NativePointerEvent> {
    pointerId: number;
    pressure: number;
    tangentialPressure: number;
    tiltX: number;
    tiltY: number;
    twist: number;
    width: number;
    height: number;
    pointerType: "mouse" | "pen" | "touch";
    isPrimary: boolean;
  }

  interface FocusEvent<T = Element> extends SyntheticEvent<T, NativeFocusEvent> {
    relatedTarget: EventTarget | null;
    target: EventTarget & T;
  }

  // tslint:disable-next-line:no-empty-interface
  interface FormEvent<T = Element> extends SyntheticEvent<T> {}

  interface ChangeEvent<T = Element> extends SyntheticEvent<T> {
    target: EventTarget & T;
  }

  interface KeyboardEvent<T = Element> extends SyntheticEvent<T, NativeKeyboardEvent> {
    altKey: boolean;
    charCode: number;
    ctrlKey: boolean;
    /**
     * See [DOM Level 3 Events spec](https://www.w3.org/TR/uievents-key/#keys-modifier). for a list of valid (case-sensitive) arguments to this method.
     */
    getModifierState(key: string): boolean;
    /**
     * See the [DOM Level 3 Events spec](https://www.w3.org/TR/uievents-key/#named-key-attribute-values). for possible values
     */
    key: string;
    keyCode: number;
    locale: string;
    location: number;
    metaKey: boolean;
    repeat: boolean;
    shiftKey: boolean;
    which: number;
  }

  interface MouseEvent<T = Element, E = NativeMouseEvent> extends UIEvent<T, E> {
    altKey: boolean;
    button: number;
    buttons: number;
    clientX: number;
    clientY: number;
    ctrlKey: boolean;
    /**
     * See [DOM Level 3 Events spec](https://www.w3.org/TR/uievents-key/#keys-modifier). for a list of valid (case-sensitive) arguments to this method.
     */
    getModifierState(key: string): boolean;
    metaKey: boolean;
    movementX: number;
    movementY: number;
    pageX: number;
    pageY: number;
    relatedTarget: EventTarget | null;
    screenX: number;
    screenY: number;
    shiftKey: boolean;
  }

  interface TouchEvent<T = Element> extends SyntheticEvent<T, NativeTouchEvent> {
    altKey: boolean;
    changedTouches: TouchList;
    ctrlKey: boolean;
    /**
     * See [DOM Level 3 Events spec](https://www.w3.org/TR/uievents-key/#keys-modifier). for a list of valid (case-sensitive) arguments to this method.
     */
    getModifierState(key: string): boolean;
    metaKey: boolean;
    shiftKey: boolean;
    targetTouches: TouchList;
    touches: TouchList;
  }

  interface UIEvent<T = Element, E = NativeUIEvent> extends SyntheticEvent<T, E> {
    detail: number;
    view: AbstractView;
  }

  interface WheelEvent<T = Element> extends MouseEvent<T, NativeWheelEvent> {
    deltaMode: number;
    deltaX: number;
    deltaY: number;
    deltaZ: number;
  }

  interface AnimationEvent<T = Element> extends SyntheticEvent<T, NativeAnimationEvent> {
    animationName: string;
    elapsedTime: number;
    pseudoElement: string;
  }

  interface TransitionEvent<T = Element> extends SyntheticEvent<T, NativeTransitionEvent> {
    elapsedTime: number;
    propertyName: string;
    pseudoElement: string;
  }

  //
  // Event Handler Types
  // ----------------------------------------------------------------------

  type EventHandler<E extends SyntheticEvent<any>> = { bivarianceHack(event: E): void }["bivarianceHack"];

  type GinnyEventHandler<T = Element> = EventHandler<SyntheticEvent<T>>;

  type ClipboardEventHandler<T = Element> = EventHandler<ClipboardEvent<T>>;
  type CompositionEventHandler<T = Element> = EventHandler<CompositionEvent<T>>;
  type DragEventHandler<T = Element> = EventHandler<DragEvent<T>>;
  type FocusEventHandler<T = Element> = EventHandler<FocusEvent<T>>;
  type FormEventHandler<T = Element> = EventHandler<FormEvent<T>>;
  type ChangeEventHandler<T = Element> = EventHandler<ChangeEvent<T>>;
  type KeyboardEventHandler<T = Element> = EventHandler<KeyboardEvent<T>>;
  type MouseEventHandler<T = Element> = EventHandler<MouseEvent<T>>;
  type TouchEventHandler<T = Element> = EventHandler<TouchEvent<T>>;
  type PointerEventHandler<T = Element> = EventHandler<PointerEvent<T>>;
  type UIEventHandler<T = Element> = EventHandler<UIEvent<T>>;
  type WheelEventHandler<T = Element> = EventHandler<WheelEvent<T>>;
  type AnimationEventHandler<T = Element> = EventHandler<AnimationEvent<T>>;
  type TransitionEventHandler<T = Element> = EventHandler<TransitionEvent<T>>;

  export type DetailedHTMLProps<E extends HTMLAttributes<T>, T> = Attributes & E;

  export interface SVGProps<T> extends SVGAttributes<T>, Attributes {}

  export interface DOMAttributes<T> {
    children?: OutputType[] | OutputType;
    dangerouslySetInnerHTML?: {
      __html: string;
    };

    // Clipboard Events
    onCopy?: ClipboardEventHandler<T>;
    onCopyCapture?: ClipboardEventHandler<T>;
    onCut?: ClipboardEventHandler<T>;
    onCutCapture?: ClipboardEventHandler<T>;
    onPaste?: ClipboardEventHandler<T>;
    onPasteCapture?: ClipboardEventHandler<T>;

    // Composition Events
    onCompositionEnd?: CompositionEventHandler<T>;
    onCompositionEndCapture?: CompositionEventHandler<T>;
    onCompositionStart?: CompositionEventHandler<T>;
    onCompositionStartCapture?: CompositionEventHandler<T>;
    onCompositionUpdate?: CompositionEventHandler<T>;
    onCompositionUpdateCapture?: CompositionEventHandler<T>;

    // Focus Events
    onFocus?: FocusEventHandler<T>;
    onFocusCapture?: FocusEventHandler<T>;
    onBlur?: FocusEventHandler<T>;
    onBlurCapture?: FocusEventHandler<T>;

    // Form Events
    onChange?: FormEventHandler<T>;
    onChangeCapture?: FormEventHandler<T>;
    onBeforeInput?: FormEventHandler<T>;
    onBeforeInputCapture?: FormEventHandler<T>;
    onInput?: FormEventHandler<T>;
    onInputCapture?: FormEventHandler<T>;
    onReset?: FormEventHandler<T>;
    onResetCapture?: FormEventHandler<T>;
    onSubmit?: FormEventHandler<T>;
    onSubmitCapture?: FormEventHandler<T>;
    onInvalid?: FormEventHandler<T>;
    onInvalidCapture?: FormEventHandler<T>;

    // Image Events
    onLoad?: GinnyEventHandler<T>;
    onLoadCapture?: GinnyEventHandler<T>;
    onError?: GinnyEventHandler<T>; // also a Media Event
    onErrorCapture?: GinnyEventHandler<T>; // also a Media Event

    // Keyboard Events
    onKeyDown?: KeyboardEventHandler<T>;
    onKeyDownCapture?: KeyboardEventHandler<T>;
    onKeyPress?: KeyboardEventHandler<T>;
    onKeyPressCapture?: KeyboardEventHandler<T>;
    onKeyUp?: KeyboardEventHandler<T>;
    onKeyUpCapture?: KeyboardEventHandler<T>;

    // Media Events
    onAbort?: GinnyEventHandler<T>;
    onAbortCapture?: GinnyEventHandler<T>;
    onCanPlay?: GinnyEventHandler<T>;
    onCanPlayCapture?: GinnyEventHandler<T>;
    onCanPlayThrough?: GinnyEventHandler<T>;
    onCanPlayThroughCapture?: GinnyEventHandler<T>;
    onDurationChange?: GinnyEventHandler<T>;
    onDurationChangeCapture?: GinnyEventHandler<T>;
    onEmptied?: GinnyEventHandler<T>;
    onEmptiedCapture?: GinnyEventHandler<T>;
    onEncrypted?: GinnyEventHandler<T>;
    onEncryptedCapture?: GinnyEventHandler<T>;
    onEnded?: GinnyEventHandler<T>;
    onEndedCapture?: GinnyEventHandler<T>;
    onLoadedData?: GinnyEventHandler<T>;
    onLoadedDataCapture?: GinnyEventHandler<T>;
    onLoadedMetadata?: GinnyEventHandler<T>;
    onLoadedMetadataCapture?: GinnyEventHandler<T>;
    onLoadStart?: GinnyEventHandler<T>;
    onLoadStartCapture?: GinnyEventHandler<T>;
    onPause?: GinnyEventHandler<T>;
    onPauseCapture?: GinnyEventHandler<T>;
    onPlay?: GinnyEventHandler<T>;
    onPlayCapture?: GinnyEventHandler<T>;
    onPlaying?: GinnyEventHandler<T>;
    onPlayingCapture?: GinnyEventHandler<T>;
    onProgress?: GinnyEventHandler<T>;
    onProgressCapture?: GinnyEventHandler<T>;
    onRateChange?: GinnyEventHandler<T>;
    onRateChangeCapture?: GinnyEventHandler<T>;
    onSeeked?: GinnyEventHandler<T>;
    onSeekedCapture?: GinnyEventHandler<T>;
    onSeeking?: GinnyEventHandler<T>;
    onSeekingCapture?: GinnyEventHandler<T>;
    onStalled?: GinnyEventHandler<T>;
    onStalledCapture?: GinnyEventHandler<T>;
    onSuspend?: GinnyEventHandler<T>;
    onSuspendCapture?: GinnyEventHandler<T>;
    onTimeUpdate?: GinnyEventHandler<T>;
    onTimeUpdateCapture?: GinnyEventHandler<T>;
    onVolumeChange?: GinnyEventHandler<T>;
    onVolumeChangeCapture?: GinnyEventHandler<T>;
    onWaiting?: GinnyEventHandler<T>;
    onWaitingCapture?: GinnyEventHandler<T>;

    // MouseEvents
    onAuxClick?: MouseEventHandler<T>;
    onAuxClickCapture?: MouseEventHandler<T>;
    onClick?: MouseEventHandler<T>;
    onClickCapture?: MouseEventHandler<T>;
    onContextMenu?: MouseEventHandler<T>;
    onContextMenuCapture?: MouseEventHandler<T>;
    onDoubleClick?: MouseEventHandler<T>;
    onDoubleClickCapture?: MouseEventHandler<T>;
    onDrag?: DragEventHandler<T>;
    onDragCapture?: DragEventHandler<T>;
    onDragEnd?: DragEventHandler<T>;
    onDragEndCapture?: DragEventHandler<T>;
    onDragEnter?: DragEventHandler<T>;
    onDragEnterCapture?: DragEventHandler<T>;
    onDragExit?: DragEventHandler<T>;
    onDragExitCapture?: DragEventHandler<T>;
    onDragLeave?: DragEventHandler<T>;
    onDragLeaveCapture?: DragEventHandler<T>;
    onDragOver?: DragEventHandler<T>;
    onDragOverCapture?: DragEventHandler<T>;
    onDragStart?: DragEventHandler<T>;
    onDragStartCapture?: DragEventHandler<T>;
    onDrop?: DragEventHandler<T>;
    onDropCapture?: DragEventHandler<T>;
    onMouseDown?: MouseEventHandler<T>;
    onMouseDownCapture?: MouseEventHandler<T>;
    onMouseEnter?: MouseEventHandler<T>;
    onMouseLeave?: MouseEventHandler<T>;
    onMouseMove?: MouseEventHandler<T>;
    onMouseMoveCapture?: MouseEventHandler<T>;
    onMouseOut?: MouseEventHandler<T>;
    onMouseOutCapture?: MouseEventHandler<T>;
    onMouseOver?: MouseEventHandler<T>;
    onMouseOverCapture?: MouseEventHandler<T>;
    onMouseUp?: MouseEventHandler<T>;
    onMouseUpCapture?: MouseEventHandler<T>;

    // Selection Events
    onSelect?: GinnyEventHandler<T>;
    onSelectCapture?: GinnyEventHandler<T>;

    // Touch Events
    onTouchCancel?: TouchEventHandler<T>;
    onTouchCancelCapture?: TouchEventHandler<T>;
    onTouchEnd?: TouchEventHandler<T>;
    onTouchEndCapture?: TouchEventHandler<T>;
    onTouchMove?: TouchEventHandler<T>;
    onTouchMoveCapture?: TouchEventHandler<T>;
    onTouchStart?: TouchEventHandler<T>;
    onTouchStartCapture?: TouchEventHandler<T>;

    // Pointer Events
    onPointerDown?: PointerEventHandler<T>;
    onPointerDownCapture?: PointerEventHandler<T>;
    onPointerMove?: PointerEventHandler<T>;
    onPointerMoveCapture?: PointerEventHandler<T>;
    onPointerUp?: PointerEventHandler<T>;
    onPointerUpCapture?: PointerEventHandler<T>;
    onPointerCancel?: PointerEventHandler<T>;
    onPointerCancelCapture?: PointerEventHandler<T>;
    onPointerEnter?: PointerEventHandler<T>;
    onPointerEnterCapture?: PointerEventHandler<T>;
    onPointerLeave?: PointerEventHandler<T>;
    onPointerLeaveCapture?: PointerEventHandler<T>;
    onPointerOver?: PointerEventHandler<T>;
    onPointerOverCapture?: PointerEventHandler<T>;
    onPointerOut?: PointerEventHandler<T>;
    onPointerOutCapture?: PointerEventHandler<T>;
    onGotPointerCapture?: PointerEventHandler<T>;
    onGotPointerCaptureCapture?: PointerEventHandler<T>;
    onLostPointerCapture?: PointerEventHandler<T>;
    onLostPointerCaptureCapture?: PointerEventHandler<T>;

    // UI Events
    onScroll?: UIEventHandler<T>;
    onScrollCapture?: UIEventHandler<T>;

    // Wheel Events
    onWheel?: WheelEventHandler<T>;
    onWheelCapture?: WheelEventHandler<T>;

    // Animation Events
    onAnimationStart?: AnimationEventHandler<T>;
    onAnimationStartCapture?: AnimationEventHandler<T>;
    onAnimationEnd?: AnimationEventHandler<T>;
    onAnimationEndCapture?: AnimationEventHandler<T>;
    onAnimationIteration?: AnimationEventHandler<T>;
    onAnimationIterationCapture?: AnimationEventHandler<T>;

    // Transition Events
    onTransitionEnd?: TransitionEventHandler<T>;
    onTransitionEndCapture?: TransitionEventHandler<T>;
  }

  export interface CSSProperties extends CSS.Properties<string | number> {
    /**
     * The index signature was removed to enable closed typing for style
     * using CSSType. You're able to use type assertion or module augmentation
     * to add properties or an index signature of your own.
     *
     * For examples and more information, visit:
     * https://github.com/frenic/csstype#what-should-i-do-when-i-get-type-errors
     */
  }

  // All the WAI-ARIA 1.1 attributes from https://www.w3.org/TR/wai-aria-1.1/
  interface AriaAttributes {
    /** Identifies the currently active element when DOM focus is on a composite widget, textbox, group, or application. */
    "aria-activedescendant"?: string;
    /** Indicates whether assistive technologies will present all, or only parts of, the changed region based on the change notifications defined by the aria-relevant attribute. */
    "aria-atomic"?: boolean | "false" | "true";
    /**
     * Indicates whether inputting text could trigger display of one or more predictions of the user's intended value for an input and specifies how predictions would be
     * presented if they are made.
     */
    "aria-autocomplete"?: "none" | "inline" | "list" | "both";
    /** Indicates an element is being modified and that assistive technologies MAY want to wait until the modifications are complete before exposing them to the user. */
    "aria-busy"?: boolean | "false" | "true";
    /**
     * Indicates the current "checked" state of checkboxes, radio buttons, and other widgets.
     * @see aria-pressed @see aria-selected.
     */
    "aria-checked"?: boolean | "false" | "mixed" | "true";
    /**
     * Defines the total number of columns in a table, grid, or treegrid.
     * @see aria-colindex.
     */
    "aria-colcount"?: number;
    /**
     * Defines an element's column index or position with respect to the total number of columns within a table, grid, or treegrid.
     * @see aria-colcount @see aria-colspan.
     */
    "aria-colindex"?: number;
    /**
     * Defines the number of columns spanned by a cell or gridcell within a table, grid, or treegrid.
     * @see aria-colindex @see aria-rowspan.
     */
    "aria-colspan"?: number;
    /**
     * Identifies the element (or elements) whose contents or presence are controlled by the current element.
     * @see aria-owns.
     */
    "aria-controls"?: string;
    /** Indicates the element that represents the current item within a container or set of related elements. */
    "aria-current"?: boolean | "false" | "true" | "page" | "step" | "location" | "date" | "time";
    /**
     * Identifies the element (or elements) that describes the object.
     * @see aria-labelledby
     */
    "aria-describedby"?: string;
    /**
     * Identifies the element that provides a detailed, extended description for the object.
     * @see aria-describedby.
     */
    "aria-details"?: string;
    /**
     * Indicates that the element is perceivable but disabled, so it is not editable or otherwise operable.
     * @see aria-hidden @see aria-readonly.
     */
    "aria-disabled"?: boolean | "false" | "true";
    /**
     * Indicates what functions can be performed when a dragged object is released on the drop target.
     * @deprecated in ARIA 1.1
     */
    "aria-dropeffect"?: "none" | "copy" | "execute" | "link" | "move" | "popup";
    /**
     * Identifies the element that provides an error message for the object.
     * @see aria-invalid @see aria-describedby.
     */
    "aria-errormessage"?: string;
    /** Indicates whether the element, or another grouping element it controls, is currently expanded or collapsed. */
    "aria-expanded"?: boolean | "false" | "true";
    /**
     * Identifies the next element (or elements) in an alternate reading order of content which, at the user's discretion,
     * allows assistive technology to override the general default of reading in document source order.
     */
    "aria-flowto"?: string;
    /**
     * Indicates an element's "grabbed" state in a drag-and-drop operation.
     * @deprecated in ARIA 1.1
     */
    "aria-grabbed"?: boolean | "false" | "true";
    /** Indicates the availability and type of interactive popup element, such as menu or dialog, that can be triggered by an element. */
    "aria-haspopup"?: boolean | "false" | "true" | "menu" | "listbox" | "tree" | "grid" | "dialog";
    /**
     * Indicates whether the element is exposed to an accessibility API.
     * @see aria-disabled.
     */
    "aria-hidden"?: boolean | "false" | "true";
    /**
     * Indicates the entered value does not conform to the format expected by the application.
     * @see aria-errormessage.
     */
    "aria-invalid"?: boolean | "false" | "true" | "grammar" | "spelling";
    /** Indicates keyboard shortcuts that an author has implemented to activate or give focus to an element. */
    "aria-keyshortcuts"?: string;
    /**
     * Defines a string value that labels the current element.
     * @see aria-labelledby.
     */
    "aria-label"?: string;
    /**
     * Identifies the element (or elements) that labels the current element.
     * @see aria-describedby.
     */
    "aria-labelledby"?: string;
    /** Defines the hierarchical level of an element within a structure. */
    "aria-level"?: number;
    /** Indicates that an element will be updated, and describes the types of updates the user agents, assistive technologies, and user can expect from the live region. */
    "aria-live"?: "off" | "assertive" | "polite";
    /** Indicates whether an element is modal when displayed. */
    "aria-modal"?: boolean | "false" | "true";
    /** Indicates whether a text box accepts multiple lines of input or only a single line. */
    "aria-multiline"?: boolean | "false" | "true";
    /** Indicates that the user may select more than one item from the current selectable descendants. */
    "aria-multiselectable"?: boolean | "false" | "true";
    /** Indicates whether the element's orientation is horizontal, vertical, or unknown/ambiguous. */
    "aria-orientation"?: "horizontal" | "vertical";
    /**
     * Identifies an element (or elements) in order to define a visual, functional, or contextual parent/child relationship
     * between DOM elements where the DOM hierarchy cannot be used to represent the relationship.
     * @see aria-controls.
     */
    "aria-owns"?: string;
    /**
     * Defines a short hint (a word or short phrase) intended to aid the user with data entry when the control has no value.
     * A hint could be a sample value or a brief description of the expected format.
     */
    "aria-placeholder"?: string;
    /**
     * Defines an element's number or position in the current set of listitems or treeitems. Not required if all elements in the set are present in the DOM.
     * @see aria-setsize.
     */
    "aria-posinset"?: number;
    /**
     * Indicates the current "pressed" state of toggle buttons.
     * @see aria-checked @see aria-selected.
     */
    "aria-pressed"?: boolean | "false" | "mixed" | "true";
    /**
     * Indicates that the element is not editable, but is otherwise operable.
     * @see aria-disabled.
     */
    "aria-readonly"?: boolean | "false" | "true";
    /**
     * Indicates what notifications the user agent will trigger when the accessibility tree within a live region is modified.
     * @see aria-atomic.
     */
    "aria-relevant"?: "additions" | "additions text" | "all" | "removals" | "text";
    /** Indicates that user input is required on the element before a form may be submitted. */
    "aria-required"?: boolean | "false" | "true";
    /** Defines a human-readable, author-localized description for the role of an element. */
    "aria-roledescription"?: string;
    /**
     * Defines the total number of rows in a table, grid, or treegrid.
     * @see aria-rowindex.
     */
    "aria-rowcount"?: number;
    /**
     * Defines an element's row index or position with respect to the total number of rows within a table, grid, or treegrid.
     * @see aria-rowcount @see aria-rowspan.
     */
    "aria-rowindex"?: number;
    /**
     * Defines the number of rows spanned by a cell or gridcell within a table, grid, or treegrid.
     * @see aria-rowindex @see aria-colspan.
     */
    "aria-rowspan"?: number;
    /**
     * Indicates the current "selected" state of various widgets.
     * @see aria-checked @see aria-pressed.
     */
    "aria-selected"?: boolean | "false" | "true";
    /**
     * Defines the number of items in the current set of listitems or treeitems. Not required if all elements in the set are present in the DOM.
     * @see aria-posinset.
     */
    "aria-setsize"?: number;
    /** Indicates if items in a table or grid are sorted in ascending or descending order. */
    "aria-sort"?: "none" | "ascending" | "descending" | "other";
    /** Defines the maximum allowed value for a range widget. */
    "aria-valuemax"?: number;
    /** Defines the minimum allowed value for a range widget. */
    "aria-valuemin"?: number;
    /**
     * Defines the current value for a range widget.
     * @see aria-valuetext.
     */
    "aria-valuenow"?: number;
    /** Defines the human readable text alternative of aria-valuenow for a range widget. */
    "aria-valuetext"?: string;
  }

  export interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
    // Ginny-specific Attributes
    defaultChecked?: boolean;
    defaultValue?: string | number | string[];
    suppressContentEditableWarning?: boolean;
    suppressHydrationWarning?: boolean;

    // Standard HTML Attributes
    accessKey?: string;
    className?: string;
    contentEditable?: Booleanish | "inherit";
    contextMenu?: string;
    dir?: string;
    draggable?: Booleanish;
    hidden?: boolean;
    id?: string;
    lang?: string;
    placeholder?: string;
    slot?: string;
    spellCheck?: Booleanish;
    style?: CSSProperties;
    tabIndex?: number;
    title?: string;
    translate?: "yes" | "no";

    // Unknown
    radioGroup?: string; // <command>, <menuitem>

    // WAI-ARIA
    role?: string;

    // RDFa Attributes
    about?: string;
    datatype?: string;
    inlist?: any;
    prefix?: string;
    property?: string;
    resource?: string;
    typeof?: string;
    vocab?: string;

    // Non-standard Attributes
    autoCapitalize?: string;
    autoCorrect?: string;
    autoSave?: string;
    color?: string;
    itemProp?: string;
    itemScope?: boolean;
    itemType?: string;
    itemID?: string;
    itemRef?: string;
    results?: number;
    security?: string;
    unselectable?: "on" | "off";

    // Living Standard
    /**
     * Hints at the type of data that might be entered by the user while editing the element or its contents
     * @see https://html.spec.whatwg.org/multipage/interaction.html#input-modalities:-the-inputmode-attribute
     */
    inputMode?: "none" | "text" | "tel" | "url" | "email" | "numeric" | "decimal" | "search";
    /**
     * Specify that a standard HTML element should behave like a defined custom built-in element
     * @see https://html.spec.whatwg.org/multipage/custom-elements.html#attr-is
     */
    is?: string;
  }

  export interface AllHTMLAttributes<T> extends HTMLAttributes<T> {
    // Standard HTML Attributes
    accept?: string;
    acceptCharset?: string;
    action?: string;
    allowFullScreen?: boolean;
    allowTransparency?: boolean;
    alt?: string;
    as?: string;
    async?: boolean;
    autoComplete?: string;
    autoFocus?: boolean;
    autoPlay?: boolean;
    capture?: boolean | string;
    cellPadding?: number | string;
    cellSpacing?: number | string;
    charSet?: string;
    challenge?: string;
    checked?: boolean;
    cite?: string;
    classID?: string;
    cols?: number;
    colSpan?: number;
    content?: string;
    controls?: boolean;
    coords?: string;
    crossOrigin?: string;
    data?: string;
    dateTime?: string;
    default?: boolean;
    defer?: boolean;
    disabled?: boolean;
    download?: any;
    encType?: string;
    form?: string;
    formAction?: string;
    formEncType?: string;
    formMethod?: string;
    formNoValidate?: boolean;
    formTarget?: string;
    frameBorder?: number | string;
    headers?: string;
    height?: number | string;
    high?: number;
    href?: string;
    hrefLang?: string;
    htmlFor?: string;
    httpEquiv?: string;
    integrity?: string;
    keyParams?: string;
    keyType?: string;
    kind?: string;
    label?: string;
    list?: string;
    loop?: boolean;
    low?: number;
    manifest?: string;
    marginHeight?: number;
    marginWidth?: number;
    max?: number | string;
    maxLength?: number;
    media?: string;
    mediaGroup?: string;
    method?: string;
    min?: number | string;
    minLength?: number;
    multiple?: boolean;
    muted?: boolean;
    name?: string;
    nonce?: string;
    noValidate?: boolean;
    open?: boolean;
    optimum?: number;
    pattern?: string;
    placeholder?: string;
    playsInline?: boolean;
    poster?: string;
    preload?: string;
    readOnly?: boolean;
    rel?: string;
    required?: boolean;
    reversed?: boolean;
    rows?: number;
    rowSpan?: number;
    sandbox?: string;
    scope?: string;
    scoped?: boolean;
    scrolling?: string;
    seamless?: boolean;
    selected?: boolean;
    shape?: string;
    size?: number;
    sizes?: string;
    span?: number;
    src?: string;
    srcDoc?: string;
    srcLang?: string;
    srcSet?: string;
    start?: number;
    step?: number | string;
    summary?: string;
    target?: string;
    type?: string;
    useMap?: string;
    value?: string | string[] | number;
    width?: number | string;
    wmode?: string;
    wrap?: string;
  }

  export interface AnchorHTMLAttributes<T> extends HTMLAttributes<T> {
    download?: any;
    href?: string;
    hrefLang?: string;
    media?: string;
    ping?: string;
    rel?: string;
    target?: string;
    type?: string;
    referrerPolicy?: string;
  }

  export interface AudioHTMLAttributes<T> extends MediaHTMLAttributes<T> {}

  export interface AreaHTMLAttributes<T> extends HTMLAttributes<T> {
    alt?: string;
    coords?: string;
    download?: any;
    href?: string;
    hrefLang?: string;
    media?: string;
    rel?: string;
    shape?: string;
    target?: string;
  }

  export interface BaseHTMLAttributes<T> extends HTMLAttributes<T> {
    href?: string;
    target?: string;
  }

  export interface BlockquoteHTMLAttributes<T> extends HTMLAttributes<T> {
    cite?: string;
  }

  export interface ButtonHTMLAttributes<T> extends HTMLAttributes<T> {
    autoFocus?: boolean;
    disabled?: boolean;
    form?: string;
    formAction?: string;
    formEncType?: string;
    formMethod?: string;
    formNoValidate?: boolean;
    formTarget?: string;
    name?: string;
    type?: "submit" | "reset" | "button";
    value?: string | string[] | number;
  }

  export interface CanvasHTMLAttributes<T> extends HTMLAttributes<T> {
    height?: number | string;
    width?: number | string;
  }

  export interface ColHTMLAttributes<T> extends HTMLAttributes<T> {
    span?: number;
    width?: number | string;
  }

  export interface ColgroupHTMLAttributes<T> extends HTMLAttributes<T> {
    span?: number;
  }

  export interface DataHTMLAttributes<T> extends HTMLAttributes<T> {
    value?: string | string[] | number;
  }

  export interface DetailsHTMLAttributes<T> extends HTMLAttributes<T> {
    open?: boolean;
  }

  export interface DelHTMLAttributes<T> extends HTMLAttributes<T> {
    cite?: string;
    dateTime?: string;
  }

  export interface DialogHTMLAttributes<T> extends HTMLAttributes<T> {
    open?: boolean;
  }

  export interface EmbedHTMLAttributes<T> extends HTMLAttributes<T> {
    height?: number | string;
    src?: string;
    type?: string;
    width?: number | string;
  }

  export interface FieldsetHTMLAttributes<T> extends HTMLAttributes<T> {
    disabled?: boolean;
    form?: string;
    name?: string;
  }

  export interface FormHTMLAttributes<T> extends HTMLAttributes<T> {
    acceptCharset?: string;
    action?: string;
    autoComplete?: string;
    encType?: string;
    method?: string;
    name?: string;
    noValidate?: boolean;
    target?: string;
  }

  export interface HtmlHTMLAttributes<T> extends HTMLAttributes<T> {
    manifest?: string;
  }

  export interface IframeHTMLAttributes<T> extends HTMLAttributes<T> {
    allow?: string;
    allowFullScreen?: boolean;
    allowTransparency?: boolean;
    frameBorder?: number | string;
    height?: number | string;
    marginHeight?: number;
    marginWidth?: number;
    name?: string;
    referrerPolicy?: string;
    sandbox?: string;
    scrolling?: string;
    seamless?: boolean;
    src?: string;
    srcDoc?: string;
    width?: number | string;
  }

  export interface ImgHTMLAttributes<T> extends HTMLAttributes<T> {
    alt?: string;
    crossOrigin?: "anonymous" | "use-credentials" | "";
    decoding?: "async" | "auto" | "sync";
    height?: number | string;
    loading?: "eager" | "lazy";
    referrerPolicy?: "no-referrer" | "origin" | "unsafe-url";
    sizes?: string;
    src?: string;
    srcSet?: string;
    useMap?: string;
    width?: number | string;
  }

  export interface InsHTMLAttributes<T> extends HTMLAttributes<T> {
    cite?: string;
    dateTime?: string;
  }

  export interface InputHTMLAttributes<T> extends HTMLAttributes<T> {
    accept?: string;
    alt?: string;
    autoComplete?: string;
    autoFocus?: boolean;
    capture?: boolean | string; // https://www.w3.org/TR/html-media-capture/#the-capture-attribute
    checked?: boolean;
    crossOrigin?: string;
    disabled?: boolean;
    form?: string;
    formAction?: string;
    formEncType?: string;
    formMethod?: string;
    formNoValidate?: boolean;
    formTarget?: string;
    height?: number | string;
    list?: string;
    max?: number | string;
    maxLength?: number;
    min?: number | string;
    minLength?: number;
    multiple?: boolean;
    name?: string;
    pattern?: string;
    placeholder?: string;
    readOnly?: boolean;
    required?: boolean;
    size?: number;
    src?: string;
    step?: number | string;
    type?: string;
    value?: string | string[] | number;
    width?: number | string;

    onChange?: ChangeEventHandler<T>;
  }

  export interface KeygenHTMLAttributes<T> extends HTMLAttributes<T> {
    autoFocus?: boolean;
    challenge?: string;
    disabled?: boolean;
    form?: string;
    keyType?: string;
    keyParams?: string;
    name?: string;
  }

  export interface LabelHTMLAttributes<T> extends HTMLAttributes<T> {
    form?: string;
    htmlFor?: string;
  }

  export interface LiHTMLAttributes<T> extends HTMLAttributes<T> {
    value?: string | string[] | number;
  }

  export interface LinkHTMLAttributes<T> extends HTMLAttributes<T> {
    as?: string;
    crossOrigin?: string;
    href?: string;
    hrefLang?: string;
    integrity?: string;
    media?: string;
    rel?: string;
    sizes?: string;
    type?: string;
    charSet?: string;
  }

  export interface MapHTMLAttributes<T> extends HTMLAttributes<T> {
    name?: string;
  }

  export interface MenuHTMLAttributes<T> extends HTMLAttributes<T> {
    type?: string;
  }

  export interface MediaHTMLAttributes<T> extends HTMLAttributes<T> {
    autoPlay?: boolean;
    controls?: boolean;
    controlsList?: string;
    crossOrigin?: string;
    loop?: boolean;
    mediaGroup?: string;
    muted?: boolean;
    playsInline?: boolean;
    preload?: string;
    src?: string;
  }

  export interface MetaHTMLAttributes<T> extends HTMLAttributes<T> {
    charSet?: string;
    content?: string;
    httpEquiv?: string;
    name?: string;
  }

  export interface MeterHTMLAttributes<T> extends HTMLAttributes<T> {
    form?: string;
    high?: number;
    low?: number;
    max?: number | string;
    min?: number | string;
    optimum?: number;
    value?: string | string[] | number;
  }

  export interface QuoteHTMLAttributes<T> extends HTMLAttributes<T> {
    cite?: string;
  }

  export interface ObjectHTMLAttributes<T> extends HTMLAttributes<T> {
    classID?: string;
    data?: string;
    form?: string;
    height?: number | string;
    name?: string;
    type?: string;
    useMap?: string;
    width?: number | string;
    wmode?: string;
  }

  export interface OlHTMLAttributes<T> extends HTMLAttributes<T> {
    reversed?: boolean;
    start?: number;
    type?: "1" | "a" | "A" | "i" | "I";
  }

  export interface OptgroupHTMLAttributes<T> extends HTMLAttributes<T> {
    disabled?: boolean;
    label?: string;
  }

  export interface OptionHTMLAttributes<T> extends HTMLAttributes<T> {
    disabled?: boolean;
    label?: string;
    selected?: boolean;
    value?: string | string[] | number;
  }

  export interface OutputHTMLAttributes<T> extends HTMLAttributes<T> {
    form?: string;
    htmlFor?: string;
    name?: string;
  }

  export interface ParamHTMLAttributes<T> extends HTMLAttributes<T> {
    name?: string;
    value?: string | string[] | number;
  }

  export interface ProgressHTMLAttributes<T> extends HTMLAttributes<T> {
    max?: number | string;
    value?: string | string[] | number;
  }

  export interface SlotHTMLAttributes<T> extends HTMLAttributes<T> {
    name?: string;
  }

  export interface ScriptHTMLAttributes<T> extends HTMLAttributes<T> {
    async?: boolean;
    charSet?: string;
    crossOrigin?: string;
    defer?: boolean;
    integrity?: string;
    noModule?: boolean;
    nonce?: string;
    src?: string;
    type?: string;
  }

  export interface SelectHTMLAttributes<T> extends HTMLAttributes<T> {
    autoComplete?: string;
    autoFocus?: boolean;
    disabled?: boolean;
    form?: string;
    multiple?: boolean;
    name?: string;
    required?: boolean;
    size?: number;
    value?: string | string[] | number;
    onChange?: ChangeEventHandler<T>;
  }

  export interface SourceHTMLAttributes<T> extends HTMLAttributes<T> {
    media?: string;
    sizes?: string;
    src?: string;
    srcSet?: string;
    type?: string;
  }

  export interface StyleHTMLAttributes<T> extends HTMLAttributes<T> {
    media?: string;
    nonce?: string;
    scoped?: boolean;
    type?: string;
  }

  export interface TableHTMLAttributes<T> extends HTMLAttributes<T> {
    cellPadding?: number | string;
    cellSpacing?: number | string;
    summary?: string;
  }

  export interface TextareaHTMLAttributes<T> extends HTMLAttributes<T> {
    autoComplete?: string;
    autoFocus?: boolean;
    cols?: number;
    dirName?: string;
    disabled?: boolean;
    form?: string;
    maxLength?: number;
    minLength?: number;
    name?: string;
    placeholder?: string;
    readOnly?: boolean;
    required?: boolean;
    rows?: number;
    value?: string | string[] | number;
    wrap?: string;

    onChange?: ChangeEventHandler<T>;
  }

  export interface TdHTMLAttributes<T> extends HTMLAttributes<T> {
    align?: "left" | "center" | "right" | "justify" | "char";
    colSpan?: number;
    headers?: string;
    rowSpan?: number;
    scope?: string;
    abbr?: string;
    valign?: "top" | "middle" | "bottom" | "baseline";
  }

  export interface ThHTMLAttributes<T> extends HTMLAttributes<T> {
    align?: "left" | "center" | "right" | "justify" | "char";
    colSpan?: number;
    headers?: string;
    rowSpan?: number;
    scope?: string;
    abbr?: string;
  }

  export interface TimeHTMLAttributes<T> extends HTMLAttributes<T> {
    dateTime?: string;
  }

  export interface TrackHTMLAttributes<T> extends HTMLAttributes<T> {
    default?: boolean;
    kind?: string;
    label?: string;
    src?: string;
    srcLang?: string;
  }

  export interface VideoHTMLAttributes<T> extends MediaHTMLAttributes<T> {
    height?: number | string;
    playsInline?: boolean;
    poster?: string;
    width?: number | string;
    disablePictureInPicture?: boolean;
  }

  // this list is "complete" in that it contains every SVG attribute
  // that Ginny supports, but the types can be improved.
  // Full list here: https://facebook.github.io/react/docs/dom-elements.html
  //
  // The three broad type categories are (in order of restrictiveness):
  //   - "number | string"
  //   - "string"
  //   - union of string literals
  export interface SVGAttributes<T> extends AriaAttributes, DOMAttributes<T> {
    // Attributes which also defined in HTMLAttributes
    // See comment in SVGDOMPropertyConfig.js
    className?: string;
    color?: string;
    height?: number | string;
    id?: string;
    lang?: string;
    max?: number | string;
    media?: string;
    method?: string;
    min?: number | string;
    name?: string;
    style?: CSSProperties;
    target?: string;
    type?: string;
    width?: number | string;

    // Other HTML properties supported by SVG elements in browsers
    role?: string;
    tabIndex?: number;
    crossOrigin?: "anonymous" | "use-credentials" | "";

    // SVG Specific attributes
    accentHeight?: number | string;
    accumulate?: "none" | "sum";
    additive?: "replace" | "sum";
    alignmentBaseline?:
      | "auto"
      | "baseline"
      | "before-edge"
      | "text-before-edge"
      | "middle"
      | "central"
      | "after-edge"
      | "text-after-edge"
      | "ideographic"
      | "alphabetic"
      | "hanging"
      | "mathematical"
      | "inherit";
    allowReorder?: "no" | "yes";
    alphabetic?: number | string;
    amplitude?: number | string;
    arabicForm?: "initial" | "medial" | "terminal" | "isolated";
    ascent?: number | string;
    attributeName?: string;
    attributeType?: string;
    autoReverse?: Booleanish;
    azimuth?: number | string;
    baseFrequency?: number | string;
    baselineShift?: number | string;
    baseProfile?: number | string;
    bbox?: number | string;
    begin?: number | string;
    bias?: number | string;
    by?: number | string;
    calcMode?: number | string;
    capHeight?: number | string;
    clip?: number | string;
    clipPath?: string;
    clipPathUnits?: number | string;
    clipRule?: number | string;
    colorInterpolation?: number | string;
    colorInterpolationFilters?: "auto" | "sRGB" | "linearRGB" | "inherit";
    colorProfile?: number | string;
    colorRendering?: number | string;
    contentScriptType?: number | string;
    contentStyleType?: number | string;
    cursor?: number | string;
    cx?: number | string;
    cy?: number | string;
    d?: string;
    decelerate?: number | string;
    descent?: number | string;
    diffuseConstant?: number | string;
    direction?: number | string;
    display?: number | string;
    divisor?: number | string;
    dominantBaseline?: number | string;
    dur?: number | string;
    dx?: number | string;
    dy?: number | string;
    edgeMode?: number | string;
    elevation?: number | string;
    enableBackground?: number | string;
    end?: number | string;
    exponent?: number | string;
    externalResourcesRequired?: Booleanish;
    fill?: string;
    fillOpacity?: number | string;
    fillRule?: "nonzero" | "evenodd" | "inherit";
    filter?: string;
    filterRes?: number | string;
    filterUnits?: number | string;
    floodColor?: number | string;
    floodOpacity?: number | string;
    focusable?: Booleanish | "auto";
    fontFamily?: string;
    fontSize?: number | string;
    fontSizeAdjust?: number | string;
    fontStretch?: number | string;
    fontStyle?: number | string;
    fontVariant?: number | string;
    fontWeight?: number | string;
    format?: number | string;
    from?: number | string;
    fx?: number | string;
    fy?: number | string;
    g1?: number | string;
    g2?: number | string;
    glyphName?: number | string;
    glyphOrientationHorizontal?: number | string;
    glyphOrientationVertical?: number | string;
    glyphRef?: number | string;
    gradientTransform?: string;
    gradientUnits?: string;
    hanging?: number | string;
    horizAdvX?: number | string;
    horizOriginX?: number | string;
    href?: string;
    ideographic?: number | string;
    imageRendering?: number | string;
    in2?: number | string;
    in?: string;
    intercept?: number | string;
    k1?: number | string;
    k2?: number | string;
    k3?: number | string;
    k4?: number | string;
    k?: number | string;
    kernelMatrix?: number | string;
    kernelUnitLength?: number | string;
    kerning?: number | string;
    keyPoints?: number | string;
    keySplines?: number | string;
    keyTimes?: number | string;
    lengthAdjust?: number | string;
    letterSpacing?: number | string;
    lightingColor?: number | string;
    limitingConeAngle?: number | string;
    local?: number | string;
    markerEnd?: string;
    markerHeight?: number | string;
    markerMid?: string;
    markerStart?: string;
    markerUnits?: number | string;
    markerWidth?: number | string;
    mask?: string;
    maskContentUnits?: number | string;
    maskUnits?: number | string;
    mathematical?: number | string;
    mode?: number | string;
    numOctaves?: number | string;
    offset?: number | string;
    opacity?: number | string;
    operator?: number | string;
    order?: number | string;
    orient?: number | string;
    orientation?: number | string;
    origin?: number | string;
    overflow?: number | string;
    overlinePosition?: number | string;
    overlineThickness?: number | string;
    paintOrder?: number | string;
    panose1?: number | string;
    path?: string;
    pathLength?: number | string;
    patternContentUnits?: string;
    patternTransform?: number | string;
    patternUnits?: string;
    pointerEvents?: number | string;
    points?: string;
    pointsAtX?: number | string;
    pointsAtY?: number | string;
    pointsAtZ?: number | string;
    preserveAlpha?: Booleanish;
    preserveAspectRatio?: string;
    primitiveUnits?: number | string;
    r?: number | string;
    radius?: number | string;
    refX?: number | string;
    refY?: number | string;
    renderingIntent?: number | string;
    repeatCount?: number | string;
    repeatDur?: number | string;
    requiredExtensions?: number | string;
    requiredFeatures?: number | string;
    restart?: number | string;
    result?: string;
    rotate?: number | string;
    rx?: number | string;
    ry?: number | string;
    scale?: number | string;
    seed?: number | string;
    shapeRendering?: number | string;
    slope?: number | string;
    spacing?: number | string;
    specularConstant?: number | string;
    specularExponent?: number | string;
    speed?: number | string;
    spreadMethod?: string;
    startOffset?: number | string;
    stdDeviation?: number | string;
    stemh?: number | string;
    stemv?: number | string;
    stitchTiles?: number | string;
    stopColor?: string;
    stopOpacity?: number | string;
    strikethroughPosition?: number | string;
    strikethroughThickness?: number | string;
    string?: number | string;
    stroke?: string;
    strokeDasharray?: string | number;
    strokeDashoffset?: string | number;
    strokeLinecap?: "butt" | "round" | "square" | "inherit";
    strokeLinejoin?: "miter" | "round" | "bevel" | "inherit";
    strokeMiterlimit?: number | string;
    strokeOpacity?: number | string;
    strokeWidth?: number | string;
    surfaceScale?: number | string;
    systemLanguage?: number | string;
    tableValues?: number | string;
    targetX?: number | string;
    targetY?: number | string;
    textAnchor?: string;
    textDecoration?: number | string;
    textLength?: number | string;
    textRendering?: number | string;
    to?: number | string;
    transform?: string;
    u1?: number | string;
    u2?: number | string;
    underlinePosition?: number | string;
    underlineThickness?: number | string;
    unicode?: number | string;
    unicodeBidi?: number | string;
    unicodeRange?: number | string;
    unitsPerEm?: number | string;
    vAlphabetic?: number | string;
    values?: string;
    vectorEffect?: number | string;
    version?: string;
    vertAdvY?: number | string;
    vertOriginX?: number | string;
    vertOriginY?: number | string;
    vHanging?: number | string;
    vIdeographic?: number | string;
    viewBox?: string;
    viewTarget?: number | string;
    visibility?: number | string;
    vMathematical?: number | string;
    widths?: number | string;
    wordSpacing?: number | string;
    writingMode?: number | string;
    x1?: number | string;
    x2?: number | string;
    x?: number | string;
    xChannelSelector?: string;
    xHeight?: number | string;
    xlinkActuate?: string;
    xlinkArcrole?: string;
    xlinkHref?: string;
    xlinkRole?: string;
    xlinkShow?: string;
    xlinkTitle?: string;
    xlinkType?: string;
    xmlBase?: string;
    xmlLang?: string;
    xmlns?: string;
    xmlnsXlink?: string;
    xmlSpace?: string;
    y1?: number | string;
    y2?: number | string;
    y?: number | string;
    yChannelSelector?: string;
    z?: number | string;
    zoomAndPan?: string;
  }

  export interface WebViewHTMLAttributes<T> extends HTMLAttributes<T> {
    allowFullScreen?: boolean;
    allowpopups?: boolean;
    autoFocus?: boolean;
    autosize?: boolean;
    blinkfeatures?: string;
    disableblinkfeatures?: string;
    disableguestresize?: boolean;
    disablewebsecurity?: boolean;
    guestinstance?: string;
    httpreferrer?: string;
    nodeintegration?: boolean;
    partition?: string;
    plugins?: boolean;
    preload?: string;
    src?: string;
    useragent?: string;
    webpreferences?: string;
  }

  //
  // Ginny.DOM
  // ----------------------------------------------------------------------

  export interface GinnyHTML {
    a: DetailedHTMLFactory<AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>;
    abbr: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
    address: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
    area: DetailedHTMLFactory<AreaHTMLAttributes<HTMLAreaElement>, HTMLAreaElement>;
    article: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
    aside: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
    audio: DetailedHTMLFactory<AudioHTMLAttributes<HTMLAudioElement>, HTMLAudioElement>;
    b: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
    base: DetailedHTMLFactory<BaseHTMLAttributes<HTMLBaseElement>, HTMLBaseElement>;
    bdi: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
    bdo: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
    big: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
    blockquote: DetailedHTMLFactory<BlockquoteHTMLAttributes<HTMLElement>, HTMLElement>;
    body: DetailedHTMLFactory<HTMLAttributes<HTMLBodyElement>, HTMLBodyElement>;
    br: DetailedHTMLFactory<HTMLAttributes<HTMLBRElement>, HTMLBRElement>;
    button: DetailedHTMLFactory<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;
    canvas: DetailedHTMLFactory<CanvasHTMLAttributes<HTMLCanvasElement>, HTMLCanvasElement>;
    caption: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
    cite: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
    code: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
    col: DetailedHTMLFactory<ColHTMLAttributes<HTMLTableColElement>, HTMLTableColElement>;
    colgroup: DetailedHTMLFactory<ColgroupHTMLAttributes<HTMLTableColElement>, HTMLTableColElement>;
    data: DetailedHTMLFactory<DataHTMLAttributes<HTMLDataElement>, HTMLDataElement>;
    datalist: DetailedHTMLFactory<HTMLAttributes<HTMLDataListElement>, HTMLDataListElement>;
    dd: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
    del: DetailedHTMLFactory<DelHTMLAttributes<HTMLElement>, HTMLElement>;
    details: DetailedHTMLFactory<DetailsHTMLAttributes<HTMLElement>, HTMLElement>;
    dfn: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
    dialog: DetailedHTMLFactory<DialogHTMLAttributes<HTMLDialogElement>, HTMLDialogElement>;
    div: DetailedHTMLFactory<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
    dl: DetailedHTMLFactory<HTMLAttributes<HTMLDListElement>, HTMLDListElement>;
    dt: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
    em: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
    embed: DetailedHTMLFactory<EmbedHTMLAttributes<HTMLEmbedElement>, HTMLEmbedElement>;
    fieldset: DetailedHTMLFactory<FieldsetHTMLAttributes<HTMLFieldSetElement>, HTMLFieldSetElement>;
    figcaption: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
    figure: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
    footer: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
    form: DetailedHTMLFactory<FormHTMLAttributes<HTMLFormElement>, HTMLFormElement>;
    h1: DetailedHTMLFactory<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
    h2: DetailedHTMLFactory<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
    h3: DetailedHTMLFactory<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
    h4: DetailedHTMLFactory<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
    h5: DetailedHTMLFactory<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
    h6: DetailedHTMLFactory<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
    head: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLHeadElement>;
    header: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
    hgroup: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
    hr: DetailedHTMLFactory<HTMLAttributes<HTMLHRElement>, HTMLHRElement>;
    html: DetailedHTMLFactory<HtmlHTMLAttributes<HTMLHtmlElement>, HTMLHtmlElement>;
    i: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
    iframe: DetailedHTMLFactory<IframeHTMLAttributes<HTMLIFrameElement>, HTMLIFrameElement>;
    img: DetailedHTMLFactory<ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>;
    input: DetailedHTMLFactory<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
    ins: DetailedHTMLFactory<InsHTMLAttributes<HTMLModElement>, HTMLModElement>;
    kbd: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
    keygen: DetailedHTMLFactory<KeygenHTMLAttributes<HTMLElement>, HTMLElement>;
    label: DetailedHTMLFactory<LabelHTMLAttributes<HTMLLabelElement>, HTMLLabelElement>;
    legend: DetailedHTMLFactory<HTMLAttributes<HTMLLegendElement>, HTMLLegendElement>;
    li: DetailedHTMLFactory<LiHTMLAttributes<HTMLLIElement>, HTMLLIElement>;
    link: DetailedHTMLFactory<LinkHTMLAttributes<HTMLLinkElement>, HTMLLinkElement>;
    main: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
    map: DetailedHTMLFactory<MapHTMLAttributes<HTMLMapElement>, HTMLMapElement>;
    mark: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
    menu: DetailedHTMLFactory<MenuHTMLAttributes<HTMLElement>, HTMLElement>;
    menuitem: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
    meta: DetailedHTMLFactory<MetaHTMLAttributes<HTMLMetaElement>, HTMLMetaElement>;
    meter: DetailedHTMLFactory<MeterHTMLAttributes<HTMLElement>, HTMLElement>;
    nav: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
    noscript: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
    object: DetailedHTMLFactory<ObjectHTMLAttributes<HTMLObjectElement>, HTMLObjectElement>;
    ol: DetailedHTMLFactory<OlHTMLAttributes<HTMLOListElement>, HTMLOListElement>;
    optgroup: DetailedHTMLFactory<OptgroupHTMLAttributes<HTMLOptGroupElement>, HTMLOptGroupElement>;
    option: DetailedHTMLFactory<OptionHTMLAttributes<HTMLOptionElement>, HTMLOptionElement>;
    output: DetailedHTMLFactory<OutputHTMLAttributes<HTMLElement>, HTMLElement>;
    p: DetailedHTMLFactory<HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement>;
    param: DetailedHTMLFactory<ParamHTMLAttributes<HTMLParamElement>, HTMLParamElement>;
    picture: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
    pre: DetailedHTMLFactory<HTMLAttributes<HTMLPreElement>, HTMLPreElement>;
    progress: DetailedHTMLFactory<ProgressHTMLAttributes<HTMLProgressElement>, HTMLProgressElement>;
    q: DetailedHTMLFactory<QuoteHTMLAttributes<HTMLQuoteElement>, HTMLQuoteElement>;
    rp: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
    rt: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
    ruby: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
    s: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
    samp: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
    slot: DetailedHTMLFactory<SlotHTMLAttributes<HTMLSlotElement>, HTMLSlotElement>;
    script: DetailedHTMLFactory<ScriptHTMLAttributes<HTMLScriptElement>, HTMLScriptElement>;
    section: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
    select: DetailedHTMLFactory<SelectHTMLAttributes<HTMLSelectElement>, HTMLSelectElement>;
    small: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
    source: DetailedHTMLFactory<SourceHTMLAttributes<HTMLSourceElement>, HTMLSourceElement>;
    span: DetailedHTMLFactory<HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>;
    strong: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
    style: DetailedHTMLFactory<StyleHTMLAttributes<HTMLStyleElement>, HTMLStyleElement>;
    sub: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
    summary: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
    sup: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
    table: DetailedHTMLFactory<TableHTMLAttributes<HTMLTableElement>, HTMLTableElement>;
    template: DetailedHTMLFactory<HTMLAttributes<HTMLTemplateElement>, HTMLTemplateElement>;
    tbody: DetailedHTMLFactory<HTMLAttributes<HTMLTableSectionElement>, HTMLTableSectionElement>;
    td: DetailedHTMLFactory<TdHTMLAttributes<HTMLTableDataCellElement>, HTMLTableDataCellElement>;
    textarea: DetailedHTMLFactory<TextareaHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement>;
    tfoot: DetailedHTMLFactory<HTMLAttributes<HTMLTableSectionElement>, HTMLTableSectionElement>;
    th: DetailedHTMLFactory<ThHTMLAttributes<HTMLTableHeaderCellElement>, HTMLTableHeaderCellElement>;
    thead: DetailedHTMLFactory<HTMLAttributes<HTMLTableSectionElement>, HTMLTableSectionElement>;
    time: DetailedHTMLFactory<TimeHTMLAttributes<HTMLElement>, HTMLElement>;
    title: DetailedHTMLFactory<HTMLAttributes<HTMLTitleElement>, HTMLTitleElement>;
    tr: DetailedHTMLFactory<HTMLAttributes<HTMLTableRowElement>, HTMLTableRowElement>;
    track: DetailedHTMLFactory<TrackHTMLAttributes<HTMLTrackElement>, HTMLTrackElement>;
    u: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
    ul: DetailedHTMLFactory<HTMLAttributes<HTMLUListElement>, HTMLUListElement>;
    var: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
    video: DetailedHTMLFactory<VideoHTMLAttributes<HTMLVideoElement>, HTMLVideoElement>;
    wbr: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
  }

  export interface GinnySVG {
    animate: SVGFactory;
    circle: SVGFactory;
    clipPath: SVGFactory;
    defs: SVGFactory;
    desc: SVGFactory;
    ellipse: SVGFactory;
    feBlend: SVGFactory;
    feColorMatrix: SVGFactory;
    feComponentTransfer: SVGFactory;
    feComposite: SVGFactory;
    feConvolveMatrix: SVGFactory;
    feDiffuseLighting: SVGFactory;
    feDisplacementMap: SVGFactory;
    feDistantLight: SVGFactory;
    feDropShadow: SVGFactory;
    feFlood: SVGFactory;
    feFuncA: SVGFactory;
    feFuncB: SVGFactory;
    feFuncG: SVGFactory;
    feFuncR: SVGFactory;
    feGaussianBlur: SVGFactory;
    feImage: SVGFactory;
    feMerge: SVGFactory;
    feMergeNode: SVGFactory;
    feMorphology: SVGFactory;
    feOffset: SVGFactory;
    fePointLight: SVGFactory;
    feSpecularLighting: SVGFactory;
    feSpotLight: SVGFactory;
    feTile: SVGFactory;
    feTurbulence: SVGFactory;
    filter: SVGFactory;
    foreignObject: SVGFactory;
    g: SVGFactory;
    image: SVGFactory;
    line: SVGFactory;
    linearGradient: SVGFactory;
    marker: SVGFactory;
    mask: SVGFactory;
    metadata: SVGFactory;
    path: SVGFactory;
    pattern: SVGFactory;
    polygon: SVGFactory;
    polyline: SVGFactory;
    radialGradient: SVGFactory;
    rect: SVGFactory;
    stop: SVGFactory;
    svg: SVGFactory;
    switch: SVGFactory;
    symbol: SVGFactory;
    text: SVGFactory;
    textPath: SVGFactory;
    tspan: SVGFactory;
    use: SVGFactory;
    view: SVGFactory;
  }

  //
  // Ginny.PropTypes
  // ----------------------------------------------------------------------

  type Validator<T> = PropTypes.Validator<T>;

  //
  // Browser Interfaces
  // https://github.com/nikeee/2048-typescript/blob/master/2048/js/touch.d.ts
  // ----------------------------------------------------------------------

  interface AbstractView {
    styleMedia: StyleMedia;
    document: Document;
  }

  interface Touch {
    identifier: number;
    target: EventTarget;
    screenX: number;
    screenY: number;
    clientX: number;
    clientY: number;
    pageX: number;
    pageY: number;
  }

  interface TouchList {
    [index: number]: Touch;
    length: number;
    item(index: number): Touch;
    identifiedTouch(identifier: number): Touch;
  }
}

declare global {
  namespace JSX {
    interface ElementAttributesProperty {
      props: {};
    }
    interface ElementChildrenAttribute {
      children: {};
    }

    interface IntrinsicAttributes extends Ginny.Attributes {}
    interface IntrinsicClassAttributes extends Ginny.Attributes {}

    interface IntrinsicElements {
      // HTML
      a: Ginny.DetailedHTMLProps<Ginny.AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>;
      abbr: Ginny.DetailedHTMLProps<Ginny.HTMLAttributes<HTMLElement>, HTMLElement>;
      address: Ginny.DetailedHTMLProps<Ginny.HTMLAttributes<HTMLElement>, HTMLElement>;
      area: Ginny.DetailedHTMLProps<Ginny.AreaHTMLAttributes<HTMLAreaElement>, HTMLAreaElement>;
      article: Ginny.DetailedHTMLProps<Ginny.HTMLAttributes<HTMLElement>, HTMLElement>;
      aside: Ginny.DetailedHTMLProps<Ginny.HTMLAttributes<HTMLElement>, HTMLElement>;
      audio: Ginny.DetailedHTMLProps<Ginny.AudioHTMLAttributes<HTMLAudioElement>, HTMLAudioElement>;
      b: Ginny.DetailedHTMLProps<Ginny.HTMLAttributes<HTMLElement>, HTMLElement>;
      base: Ginny.DetailedHTMLProps<Ginny.BaseHTMLAttributes<HTMLBaseElement>, HTMLBaseElement>;
      bdi: Ginny.DetailedHTMLProps<Ginny.HTMLAttributes<HTMLElement>, HTMLElement>;
      bdo: Ginny.DetailedHTMLProps<Ginny.HTMLAttributes<HTMLElement>, HTMLElement>;
      big: Ginny.DetailedHTMLProps<Ginny.HTMLAttributes<HTMLElement>, HTMLElement>;
      blockquote: Ginny.DetailedHTMLProps<Ginny.BlockquoteHTMLAttributes<HTMLElement>, HTMLElement>;
      body: Ginny.DetailedHTMLProps<Ginny.HTMLAttributes<HTMLBodyElement>, HTMLBodyElement>;
      br: Ginny.DetailedHTMLProps<Ginny.HTMLAttributes<HTMLBRElement>, HTMLBRElement>;
      button: Ginny.DetailedHTMLProps<Ginny.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;
      canvas: Ginny.DetailedHTMLProps<Ginny.CanvasHTMLAttributes<HTMLCanvasElement>, HTMLCanvasElement>;
      caption: Ginny.DetailedHTMLProps<Ginny.HTMLAttributes<HTMLElement>, HTMLElement>;
      cite: Ginny.DetailedHTMLProps<Ginny.HTMLAttributes<HTMLElement>, HTMLElement>;
      code: Ginny.DetailedHTMLProps<Ginny.HTMLAttributes<HTMLElement>, HTMLElement>;
      col: Ginny.DetailedHTMLProps<Ginny.ColHTMLAttributes<HTMLTableColElement>, HTMLTableColElement>;
      colgroup: Ginny.DetailedHTMLProps<Ginny.ColgroupHTMLAttributes<HTMLTableColElement>, HTMLTableColElement>;
      data: Ginny.DetailedHTMLProps<Ginny.DataHTMLAttributes<HTMLDataElement>, HTMLDataElement>;
      datalist: Ginny.DetailedHTMLProps<Ginny.HTMLAttributes<HTMLDataListElement>, HTMLDataListElement>;
      dd: Ginny.DetailedHTMLProps<Ginny.HTMLAttributes<HTMLElement>, HTMLElement>;
      del: Ginny.DetailedHTMLProps<Ginny.DelHTMLAttributes<HTMLElement>, HTMLElement>;
      details: Ginny.DetailedHTMLProps<Ginny.DetailsHTMLAttributes<HTMLElement>, HTMLElement>;
      dfn: Ginny.DetailedHTMLProps<Ginny.HTMLAttributes<HTMLElement>, HTMLElement>;
      dialog: Ginny.DetailedHTMLProps<Ginny.DialogHTMLAttributes<HTMLDialogElement>, HTMLDialogElement>;
      div: Ginny.DetailedHTMLProps<Ginny.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
      dl: Ginny.DetailedHTMLProps<Ginny.HTMLAttributes<HTMLDListElement>, HTMLDListElement>;
      dt: Ginny.DetailedHTMLProps<Ginny.HTMLAttributes<HTMLElement>, HTMLElement>;
      em: Ginny.DetailedHTMLProps<Ginny.HTMLAttributes<HTMLElement>, HTMLElement>;
      embed: Ginny.DetailedHTMLProps<Ginny.EmbedHTMLAttributes<HTMLEmbedElement>, HTMLEmbedElement>;
      fieldset: Ginny.DetailedHTMLProps<Ginny.FieldsetHTMLAttributes<HTMLFieldSetElement>, HTMLFieldSetElement>;
      figcaption: Ginny.DetailedHTMLProps<Ginny.HTMLAttributes<HTMLElement>, HTMLElement>;
      figure: Ginny.DetailedHTMLProps<Ginny.HTMLAttributes<HTMLElement>, HTMLElement>;
      footer: Ginny.DetailedHTMLProps<Ginny.HTMLAttributes<HTMLElement>, HTMLElement>;
      form: Ginny.DetailedHTMLProps<Ginny.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement>;
      h1: Ginny.DetailedHTMLProps<Ginny.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
      h2: Ginny.DetailedHTMLProps<Ginny.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
      h3: Ginny.DetailedHTMLProps<Ginny.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
      h4: Ginny.DetailedHTMLProps<Ginny.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
      h5: Ginny.DetailedHTMLProps<Ginny.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
      h6: Ginny.DetailedHTMLProps<Ginny.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
      head: Ginny.DetailedHTMLProps<Ginny.HTMLAttributes<HTMLHeadElement>, HTMLHeadElement>;
      header: Ginny.DetailedHTMLProps<Ginny.HTMLAttributes<HTMLElement>, HTMLElement>;
      hgroup: Ginny.DetailedHTMLProps<Ginny.HTMLAttributes<HTMLElement>, HTMLElement>;
      hr: Ginny.DetailedHTMLProps<Ginny.HTMLAttributes<HTMLHRElement>, HTMLHRElement>;
      html: Ginny.DetailedHTMLProps<Ginny.HtmlHTMLAttributes<HTMLHtmlElement>, HTMLHtmlElement>;
      i: Ginny.DetailedHTMLProps<Ginny.HTMLAttributes<HTMLElement>, HTMLElement>;
      iframe: Ginny.DetailedHTMLProps<Ginny.IframeHTMLAttributes<HTMLIFrameElement>, HTMLIFrameElement>;
      img: Ginny.DetailedHTMLProps<Ginny.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>;
      input: Ginny.DetailedHTMLProps<Ginny.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
      ins: Ginny.DetailedHTMLProps<Ginny.InsHTMLAttributes<HTMLModElement>, HTMLModElement>;
      kbd: Ginny.DetailedHTMLProps<Ginny.HTMLAttributes<HTMLElement>, HTMLElement>;
      keygen: Ginny.DetailedHTMLProps<Ginny.KeygenHTMLAttributes<HTMLElement>, HTMLElement>;
      label: Ginny.DetailedHTMLProps<Ginny.LabelHTMLAttributes<HTMLLabelElement>, HTMLLabelElement>;
      legend: Ginny.DetailedHTMLProps<Ginny.HTMLAttributes<HTMLLegendElement>, HTMLLegendElement>;
      li: Ginny.DetailedHTMLProps<Ginny.LiHTMLAttributes<HTMLLIElement>, HTMLLIElement>;
      link: Ginny.DetailedHTMLProps<Ginny.LinkHTMLAttributes<HTMLLinkElement>, HTMLLinkElement>;
      main: Ginny.DetailedHTMLProps<Ginny.HTMLAttributes<HTMLElement>, HTMLElement>;
      map: Ginny.DetailedHTMLProps<Ginny.MapHTMLAttributes<HTMLMapElement>, HTMLMapElement>;
      mark: Ginny.DetailedHTMLProps<Ginny.HTMLAttributes<HTMLElement>, HTMLElement>;
      menu: Ginny.DetailedHTMLProps<Ginny.MenuHTMLAttributes<HTMLElement>, HTMLElement>;
      menuitem: Ginny.DetailedHTMLProps<Ginny.HTMLAttributes<HTMLElement>, HTMLElement>;
      meta: Ginny.DetailedHTMLProps<Ginny.MetaHTMLAttributes<HTMLMetaElement>, HTMLMetaElement>;
      meter: Ginny.DetailedHTMLProps<Ginny.MeterHTMLAttributes<HTMLElement>, HTMLElement>;
      nav: Ginny.DetailedHTMLProps<Ginny.HTMLAttributes<HTMLElement>, HTMLElement>;
      noindex: Ginny.DetailedHTMLProps<Ginny.HTMLAttributes<HTMLElement>, HTMLElement>;
      noscript: Ginny.DetailedHTMLProps<Ginny.HTMLAttributes<HTMLElement>, HTMLElement>;
      object: Ginny.DetailedHTMLProps<Ginny.ObjectHTMLAttributes<HTMLObjectElement>, HTMLObjectElement>;
      ol: Ginny.DetailedHTMLProps<Ginny.OlHTMLAttributes<HTMLOListElement>, HTMLOListElement>;
      optgroup: Ginny.DetailedHTMLProps<Ginny.OptgroupHTMLAttributes<HTMLOptGroupElement>, HTMLOptGroupElement>;
      option: Ginny.DetailedHTMLProps<Ginny.OptionHTMLAttributes<HTMLOptionElement>, HTMLOptionElement>;
      output: Ginny.DetailedHTMLProps<Ginny.OutputHTMLAttributes<HTMLElement>, HTMLElement>;
      p: Ginny.DetailedHTMLProps<Ginny.HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement>;
      param: Ginny.DetailedHTMLProps<Ginny.ParamHTMLAttributes<HTMLParamElement>, HTMLParamElement>;
      picture: Ginny.DetailedHTMLProps<Ginny.HTMLAttributes<HTMLElement>, HTMLElement>;
      pre: Ginny.DetailedHTMLProps<Ginny.HTMLAttributes<HTMLPreElement>, HTMLPreElement>;
      progress: Ginny.DetailedHTMLProps<Ginny.ProgressHTMLAttributes<HTMLProgressElement>, HTMLProgressElement>;
      q: Ginny.DetailedHTMLProps<Ginny.QuoteHTMLAttributes<HTMLQuoteElement>, HTMLQuoteElement>;
      rp: Ginny.DetailedHTMLProps<Ginny.HTMLAttributes<HTMLElement>, HTMLElement>;
      rt: Ginny.DetailedHTMLProps<Ginny.HTMLAttributes<HTMLElement>, HTMLElement>;
      ruby: Ginny.DetailedHTMLProps<Ginny.HTMLAttributes<HTMLElement>, HTMLElement>;
      s: Ginny.DetailedHTMLProps<Ginny.HTMLAttributes<HTMLElement>, HTMLElement>;
      samp: Ginny.DetailedHTMLProps<Ginny.HTMLAttributes<HTMLElement>, HTMLElement>;
      slot: Ginny.DetailedHTMLProps<Ginny.SlotHTMLAttributes<HTMLSlotElement>, HTMLSlotElement>;
      script: Ginny.DetailedHTMLProps<Ginny.ScriptHTMLAttributes<HTMLScriptElement>, HTMLScriptElement>;
      section: Ginny.DetailedHTMLProps<Ginny.HTMLAttributes<HTMLElement>, HTMLElement>;
      select: Ginny.DetailedHTMLProps<Ginny.SelectHTMLAttributes<HTMLSelectElement>, HTMLSelectElement>;
      small: Ginny.DetailedHTMLProps<Ginny.HTMLAttributes<HTMLElement>, HTMLElement>;
      source: Ginny.DetailedHTMLProps<Ginny.SourceHTMLAttributes<HTMLSourceElement>, HTMLSourceElement>;
      span: Ginny.DetailedHTMLProps<Ginny.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>;
      strong: Ginny.DetailedHTMLProps<Ginny.HTMLAttributes<HTMLElement>, HTMLElement>;
      style: Ginny.DetailedHTMLProps<Ginny.StyleHTMLAttributes<HTMLStyleElement>, HTMLStyleElement>;
      sub: Ginny.DetailedHTMLProps<Ginny.HTMLAttributes<HTMLElement>, HTMLElement>;
      summary: Ginny.DetailedHTMLProps<Ginny.HTMLAttributes<HTMLElement>, HTMLElement>;
      sup: Ginny.DetailedHTMLProps<Ginny.HTMLAttributes<HTMLElement>, HTMLElement>;
      table: Ginny.DetailedHTMLProps<Ginny.TableHTMLAttributes<HTMLTableElement>, HTMLTableElement>;
      template: Ginny.DetailedHTMLProps<Ginny.HTMLAttributes<HTMLTemplateElement>, HTMLTemplateElement>;
      tbody: Ginny.DetailedHTMLProps<Ginny.HTMLAttributes<HTMLTableSectionElement>, HTMLTableSectionElement>;
      td: Ginny.DetailedHTMLProps<Ginny.TdHTMLAttributes<HTMLTableDataCellElement>, HTMLTableDataCellElement>;
      textarea: Ginny.DetailedHTMLProps<Ginny.TextareaHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement>;
      tfoot: Ginny.DetailedHTMLProps<Ginny.HTMLAttributes<HTMLTableSectionElement>, HTMLTableSectionElement>;
      th: Ginny.DetailedHTMLProps<Ginny.ThHTMLAttributes<HTMLTableHeaderCellElement>, HTMLTableHeaderCellElement>;
      thead: Ginny.DetailedHTMLProps<Ginny.HTMLAttributes<HTMLTableSectionElement>, HTMLTableSectionElement>;
      time: Ginny.DetailedHTMLProps<Ginny.TimeHTMLAttributes<HTMLElement>, HTMLElement>;
      title: Ginny.DetailedHTMLProps<Ginny.HTMLAttributes<HTMLTitleElement>, HTMLTitleElement>;
      tr: Ginny.DetailedHTMLProps<Ginny.HTMLAttributes<HTMLTableRowElement>, HTMLTableRowElement>;
      track: Ginny.DetailedHTMLProps<Ginny.TrackHTMLAttributes<HTMLTrackElement>, HTMLTrackElement>;
      u: Ginny.DetailedHTMLProps<Ginny.HTMLAttributes<HTMLElement>, HTMLElement>;
      ul: Ginny.DetailedHTMLProps<Ginny.HTMLAttributes<HTMLUListElement>, HTMLUListElement>;
      var: Ginny.DetailedHTMLProps<Ginny.HTMLAttributes<HTMLElement>, HTMLElement>;
      video: Ginny.DetailedHTMLProps<Ginny.VideoHTMLAttributes<HTMLVideoElement>, HTMLVideoElement>;
      wbr: Ginny.DetailedHTMLProps<Ginny.HTMLAttributes<HTMLElement>, HTMLElement>;

      // SVG
      svg: Ginny.SVGProps<SVGSVGElement>;

      animate: Ginny.SVGProps<SVGElement>; // TODO: It is SVGAnimateElement but is not in TypeScript's lib.dom.d.ts for now.
      animateMotion: Ginny.SVGProps<SVGElement>;
      animateTransform: Ginny.SVGProps<SVGElement>; // TODO: It is SVGAnimateTransformElement but is not in TypeScript's lib.dom.d.ts for now.
      circle: Ginny.SVGProps<SVGCircleElement>;
      clipPath: Ginny.SVGProps<SVGClipPathElement>;
      defs: Ginny.SVGProps<SVGDefsElement>;
      desc: Ginny.SVGProps<SVGDescElement>;
      ellipse: Ginny.SVGProps<SVGEllipseElement>;
      feBlend: Ginny.SVGProps<SVGFEBlendElement>;
      feColorMatrix: Ginny.SVGProps<SVGFEColorMatrixElement>;
      feComponentTransfer: Ginny.SVGProps<SVGFEComponentTransferElement>;
      feComposite: Ginny.SVGProps<SVGFECompositeElement>;
      feConvolveMatrix: Ginny.SVGProps<SVGFEConvolveMatrixElement>;
      feDiffuseLighting: Ginny.SVGProps<SVGFEDiffuseLightingElement>;
      feDisplacementMap: Ginny.SVGProps<SVGFEDisplacementMapElement>;
      feDistantLight: Ginny.SVGProps<SVGFEDistantLightElement>;
      feDropShadow: Ginny.SVGProps<SVGFEDropShadowElement>;
      feFlood: Ginny.SVGProps<SVGFEFloodElement>;
      feFuncA: Ginny.SVGProps<SVGFEFuncAElement>;
      feFuncB: Ginny.SVGProps<SVGFEFuncBElement>;
      feFuncG: Ginny.SVGProps<SVGFEFuncGElement>;
      feFuncR: Ginny.SVGProps<SVGFEFuncRElement>;
      feGaussianBlur: Ginny.SVGProps<SVGFEGaussianBlurElement>;
      feImage: Ginny.SVGProps<SVGFEImageElement>;
      feMerge: Ginny.SVGProps<SVGFEMergeElement>;
      feMergeNode: Ginny.SVGProps<SVGFEMergeNodeElement>;
      feMorphology: Ginny.SVGProps<SVGFEMorphologyElement>;
      feOffset: Ginny.SVGProps<SVGFEOffsetElement>;
      fePointLight: Ginny.SVGProps<SVGFEPointLightElement>;
      feSpecularLighting: Ginny.SVGProps<SVGFESpecularLightingElement>;
      feSpotLight: Ginny.SVGProps<SVGFESpotLightElement>;
      feTile: Ginny.SVGProps<SVGFETileElement>;
      feTurbulence: Ginny.SVGProps<SVGFETurbulenceElement>;
      filter: Ginny.SVGProps<SVGFilterElement>;
      foreignObject: Ginny.SVGProps<SVGForeignObjectElement>;
      g: Ginny.SVGProps<SVGGElement>;
      image: Ginny.SVGProps<SVGImageElement>;
      line: Ginny.SVGProps<SVGLineElement>;
      linearGradient: Ginny.SVGProps<SVGLinearGradientElement>;
      marker: Ginny.SVGProps<SVGMarkerElement>;
      mask: Ginny.SVGProps<SVGMaskElement>;
      metadata: Ginny.SVGProps<SVGMetadataElement>;
      mpath: Ginny.SVGProps<SVGElement>;
      path: Ginny.SVGProps<SVGPathElement>;
      pattern: Ginny.SVGProps<SVGPatternElement>;
      polygon: Ginny.SVGProps<SVGPolygonElement>;
      polyline: Ginny.SVGProps<SVGPolylineElement>;
      radialGradient: Ginny.SVGProps<SVGRadialGradientElement>;
      rect: Ginny.SVGProps<SVGRectElement>;
      stop: Ginny.SVGProps<SVGStopElement>;
      switch: Ginny.SVGProps<SVGSwitchElement>;
      symbol: Ginny.SVGProps<SVGSymbolElement>;
      text: Ginny.SVGProps<SVGTextElement>;
      textPath: Ginny.SVGProps<SVGTextPathElement>;
      tspan: Ginny.SVGProps<SVGTSpanElement>;
      use: Ginny.SVGProps<SVGUseElement>;
      view: Ginny.SVGProps<SVGViewElement>;

      // Custom
      markdown: Ginny.DetailedHTMLProps<Ginny.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
    }
  }
}
