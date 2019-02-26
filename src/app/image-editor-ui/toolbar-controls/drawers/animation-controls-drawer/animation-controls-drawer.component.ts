import {fabric} from 'fabric';
import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';
import {Settings} from 'common/core/config/settings.service';
import {DomSanitizer, SafeStyle} from '@angular/platform-browser';
import {CanvasService} from '../../../../image-editor/canvas/canvas.service';
import {ActiveObjectService} from '../../../../image-editor/canvas/active-object/active-object.service';
import {FillToolService} from '../../../../image-editor/tools/fill/fill-tool.service';
import {ImportToolService} from '../../../../image-editor/tools/import/import-tool.service';
import {Store} from '@ngxs/store';
import {MarkAsDirty} from '../../../state/background/background.actions';

@Component({
    selector: 'animation-controls-drawer',
    templateUrl: './animation-controls-drawer.component.html',
    styleUrls: ['./animation-controls-drawer.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})
export class AnimationControlsDrawerComponent {
    public defaultAnimation = [
        'easeInSine',
        'easeOutSine',
        'easeInOutSine',
        'easeInQuad',
        'easeOutQuad',
        'easeInOutQuad',
        'easeInCubic',
        'easeOutCubic',
        'easeInOutCubic',
        'easeInQuart',
        'easeOutQuart',
        'easeInOutQuart',
        'easeInQuint',
        'easeOutQuint',
        'easeInOutQuint',
        'easeInExpo',
        'easeOutExpo',
        'easeInOutExpo',
        'easeInCirc',
        'easeOutCirc',
        'easeInOutCirc',
        'easeInBack',
        'easeOutBack',
        'easeInOutBack',
        'easeInElastic',
        'easeOutElastic',
        'easeInOutElastic',
        'easeInBounce',
        'easeOutBounce',
        'easeInOutBounce',
    ];

    public animSetting = {
        type: "left",
        value: 0,
        duration: 1000
    };

    public AnimTypes = ["left", "top"];


    constructor(
        private canvas: CanvasService,
        public activeObject: ActiveObjectService,
        private settings: Settings,
        private sanitizer: DomSanitizer,
        private fillTool: FillToolService,
        private importTool: ImportToolService,
        private store: Store,
    ) {}

    private getAnimationUrl(index: number): string {
        return this.settings.getAssetUrl('images/animations/' + this.defaultAnimation [index] + '.png');
    }

    public setAnimation(index: number) {
        var oldValue = this.activeObject.get()[this.animSetting.type];
        this.activeObject.get().animate(this.animSetting.type, oldValue + this.animSetting.value, {
            duration: this.animSetting.duration,
            onChange: this.canvas.render.bind(this.canvas),
            onComplete: () => {
                this.activeObject.get().animate(this.animSetting.type, oldValue, {
                    duration: 1,
                    onChange: this.canvas.render.bind(this.canvas),
                    onComplete: () => {
                        this.store.dispatch(new MarkAsDirty());
                    }
                });
//                this.activeObject.get().
//                this.activeObject.move(<'top'|'right'|'bottom'|'left'>this.animSetting.type, - this.animSetting.value);
//                this.canvas.render();
            },
            easing: fabric.util.ease[this.defaultAnimation [index]]
        });
//        this.fillTool.withPattern(this.getAnimationUrl(index));
    }

    public applyChanges() {
        // if (this.store.selectSnapshot(ResizeState.dirty)) {
        //     this.store.dispatch(new ApplyChanges(DrawerName.RESIZE));
        // }
    }
}
