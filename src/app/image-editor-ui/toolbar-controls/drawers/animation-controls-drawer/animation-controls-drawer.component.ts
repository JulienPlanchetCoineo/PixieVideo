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
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
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

    public AnimProperties = ["left", "top"];

    public isAnimating = false;

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
        if (this.isAnimating) return;
        this.isAnimating = true;
        
        this.activeObject.form.get('animation').patchValue({
            easing: fabric.util.ease[this.defaultAnimation [index]]
        });
        const animation = this.activeObject.form.get('animation').value;

        const activeObject = this.activeObject.get();
        const oldValue = activeObject[animation.property];

        activeObject.animate(animation.property, oldValue + animation.by, {
            duration: animation.duration,
            onChange: this.canvas.render.bind(this.canvas),
            onComplete: () => {
                activeObject.animate(animation.property, oldValue, {
                    duration: 1,
                    onChange: this.canvas.render.bind(this.canvas),
                    onComplete: () => {
                        this.isAnimating = false;
                    }
                });
            },
            easing: animation.easing
        });
    }
    
    public applyChanges() {
        console.log("AAAAAAAAAAAAAA", "Apply");
        // if (this.store.selectSnapshot(ResizeState.dirty)) {
        //     this.store.dispatch(new ApplyChanges(DrawerName.RESIZE));
        // }
    }

    public cancelChanges() {
        console.log("AAAAAAAAAAAAAA", "Cancel");
    }
}
