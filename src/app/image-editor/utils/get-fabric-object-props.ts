import {fabric} from 'fabric';
import {IObjectOptions, IText, ITextOptions, Object as fabricObject, Shadow, IAnimationOptions} from 'fabric/fabric-impl';
import {defaultObjectProps} from '../objects/default-object-props';

export function getFabricObjectProps(obj: fabricObject) {
    if ( ! obj) return {};
    const shadow = obj.shadow as Shadow;

    const props = {
        fill: obj.fill,
        opacity: obj.opacity,
        backgroundColor: obj.backgroundColor,
        stroke: obj.stroke,
        strokeWidth: obj.strokeWidth,
    } as ITextOptions;

    if (shadow) {
        props.shadow = {
            color: shadow.color || defaultObjectProps.shadow.color,
            blur: shadow.blur || defaultObjectProps.shadow.blur,
            offsetX: shadow.offsetX || defaultObjectProps.shadow.offsetX,
            offsetY: shadow.offsetY || defaultObjectProps.shadow.offsetY,
        };
    }

    if (obj.type === 'i-text') {
        const text = obj as IText;
        props.textAlign = text.textAlign;
        props.underline = text.underline;
        props.linethrough = text.linethrough;
        props.fontStyle = text.fontStyle;
        props.fontFamily = text.fontFamily;
        props.fontWeight = text.fontWeight;
    }

    props.animation = {} as IAnimationOptions;
    props.animation.property = obj.animation.property;
    props.animation.by = obj.animation.by;
    props.animation.duration = obj.animation.duration;
    props.animation.easing = obj.animation.easing || fabric.util.ease[defaultObjectProps.animation.easing];

    return props;
}
