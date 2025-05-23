// -----------------------------------------------------------------------------
import React from "react";
import {useEffect, useState, useRef} from "react";
// -----------------------------------------------------------------------------
import {fabric} from "fabric";
// -----------------------------------------------------------------------------
import { useMoodboardEditorController } from "@/contexts/Moodboard/Editor/MoodboardEditorContext";
import MoodboardItemModel from "@/models/Moodboard/MoodboardItem";
// -----------------------------------------------------------------------------
import MoodboardCanvasControls from "./Controls/CanvasControls";
import EventType from "./Controls/EventType";
import {FLOW_STATE_EDITING} from "../utils/FlowState";
// -----------------------------------------------------------------------------
import styles from "./MoodboardCanvas.module.css";


// -----------------------------------------------------------------------------
function MoodboardCanvas({flowState, xxx_OnCanvasHasChanged})
{
  const _editorController = useMoodboardEditorController();
  if(!_editorController) {
    return;
  }


  const _canvasController = _editorController.canvasController;
  if(!_canvasController) {
    return;
  }

  _canvasController.xxx_OnCanvasHasChanged = xxx_OnCanvasHasChanged;


  const _moodboardModel = _editorController.moodboardModel;
  if(!_moodboardModel) {
    return;
  }


  //
  // React Hooks
  //

  // ---------------------------------------------------------------------------
  const _canvas_ref        = useRef(null);
  const _fabric_canvas_ref = useRef(null);

  const [selection, setSelection]                 = useState(null);
  const [editableClassName, setEditableClassName] = useState("");

  // ---------------------------------------------------------------------------
  useEffect(() => {
    const value = (flowState != FLOW_STATE_EDITING) ? styles.canvasContainerLocked : "";
    setEditableClassName(value);
  }, [flowState]);

  // ---------------------------------------------------------------------------
  useEffect(() => {
    //
    const canvas = _canvas_ref.current;

    // Setup Fabric
    const fabric_canvas = new fabric.Canvas(canvas, {
      width:                  canvas.parentElement.clientWidth,
      height:                 canvas.parentElement.clientHeight,
      preserveObjectStacking: true, // This prevents automatic bringing to front
    });

    _fabric_canvas_ref.current = fabric_canvas;
    _canvasController.SetCanvas(fabric_canvas);

    // Event Listeners...
    fabric_canvas.on("drop", _HandleDrop);

    fabric_canvas.on("selection:created", _HandleOnSelection);
    fabric_canvas.on("selection:cleared", _HandleOnDeselection);

    fabric_canvas.on("object:moving",    xxx_OnCanvasHasChanged);
    fabric_canvas.on("object:scaling",   xxx_OnCanvasHasChanged);

    window.addEventListener("resize", _ResizeCanvas);

    if(_moodboardModel.fabricItems) {
      fabric_canvas.loadFromJSON(_moodboardModel.fabricItems, function() {
        // Iterate over all objects on the canvas to ensure they are selectable
        fabric_canvas.getObjects().forEach(function(o) {
            o.set('selectable', true);
        });
      });

      fabric_canvas.selection = true;
      fabric_canvas.interactive = true;

      for(let i = 0; i < _moodboardModel.fabricItems.length; ++i) {
        const item = _moodboardModel.fabricItems[i];
        const a = 10;
        const b = 20;
      }
    }

    // Return
    return () => {
      window.removeEventListener("resize", _ResizeCanvas);

      fabric_canvas.off("drop", _HandleDrop);

      fabric_canvas.off("selection:cleared", _HandleOnDeselection);
      fabric_canvas.off("selection:created", _HandleOnSelection);

      fabric_canvas.off("object:moving",    xxx_OnCanvasHasChanged);
      fabric_canvas.off("object:scaling",   xxx_OnCanvasHasChanged);

      _canvasController.xxx_OnCanvasHasChanged = null;
    };
  }, [_moodboardModel]);


  //
  // Drag Events
  //

  // ---------------------------------------------------------------------------
  const _HandleDrop = (event) => {
    const e = event.e;
    e.preventDefault();

    // Get the model.
    const text = e.dataTransfer.getData("text");
    const data = JSON.parse(text);

    const item_model = MoodboardItemModel.CreateFromData(data);
    _canvasController.XXX_AddExternalImage(item_model, e);
  };


  //
  // Selection Events
  //

  // ---------------------------------------------------------------------------
  const _HandleOnSelection = (ob) => {
    setSelection(ob);
  };

  const _HandleOnDeselection = () => {
    setSelection(null);
  };


  //
  // Resize Events
  //

  // ---------------------------------------------------------------------------
  const _ResizeCanvas = () => {
    const canvas        = _canvas_ref.current;
    const fabric_canvas = _fabric_canvas_ref.current;

    canvas.width  = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;

    fabric_canvas.setWidth(canvas.width);
    fabric_canvas.setHeight(canvas.height);
  };


  //
  // Moodboard Controls Events
  //

  // ---------------------------------------------------------------------------
  const _HandleMoodboardControlsClick = (eventType) => {
    if (!selection) {
      return;
    }

    const fabric_canvas = _fabric_canvas_ref.current;
    for (let item of selection.selected) {
      switch (eventType) {
        case EventType.Delete:          { _canvasController.DeleteItem   (item); } break;
        case EventType.Duplicate:       { _canvasController.DuplicateItem(item); } break;

        case EventType.Flip_Horizontal: { item.set("flipX", !item.flipX); } break;
        case EventType.Flip_Vertical:   { item.set("flipY", !item.flipY); } break;
        // case EventType.Resize: { } break;

        case EventType.Send_To_Back:    { fabric_canvas.sendToBack  (item); } break;
        case EventType.Send_To_Front:   { fabric_canvas.bringToFront(item); } break;

        default: {
          console.log(eventType);
          debugger;
        } break;
      }
    }

    fabric_canvas.requestRenderAll();
  };

  //
  // Zoom Functions
  //

  // ---------------------------------------------------------------------------
  const _HandleZoom = (event) => {
    event.preventDefault();
    if (event.deltaY < 0) {
      _ZoomIn();
    }
    else {
      _ZoomOut();
    }
  };

  // ---------------------------------------------------------------------------
  function _ZoomIn()
  {
    const fabric_canvas = _fabric_canvas_ref.current;
    fabric_canvas.setZoom(fabric_canvas.getZoom() * 1.1);
    fabric_canvas.renderAll();
  }

  // ---------------------------------------------------------------------------
  function _ZoomOut()
  {
    const fabric_canvas = _fabric_canvas_ref.current;
    fabric_canvas.setZoom(fabric_canvas.getZoom() / 1.1);
    fabric_canvas.renderAll();
  }


  //
  // Component
  //

  // ---------------------------------------------------------------------------
  const class_name = `${styles.canvasContainer} ${editableClassName}`;
  return (
    <div className={class_name}>
      <div
        style={{
          display:
            selection && editableClassName.length == 0
            ? "block"
            : "none"
        }}
      >
        <MoodboardCanvasControls onClick={_HandleMoodboardControlsClick}/>
      </div>

      <canvas ref={_canvas_ref}/>
    </div>
  );
};

// -----------------------------------------------------------------------------
export default MoodboardCanvas;
