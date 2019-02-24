import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';
import {Settings} from 'common/core/config/settings.service';
import {DomSanitizer, SafeStyle} from '@angular/platform-browser';
import {ActiveObjectService} from '../../../../image-editor/canvas/active-object/active-object.service';
import {FillToolService} from '../../../../image-editor/tools/fill/fill-tool.service';
import {ImportToolService} from '../../../../image-editor/tools/import/import-tool.service';

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
    ];

    constructor(
        public activeObject: ActiveObjectService,
        private settings: Settings,
        private sanitizer: DomSanitizer,
        private fillTool: FillToolService,
        private importTool: ImportToolService,
    ) {}

    public getAnimationBgStyle(index: number): SafeStyle {
        return this.sanitizer.bypassSecurityTrustStyle(
            'url(' + this.getAnimationUrl(index) + ')'
        );
    }

    private getAnimationUrl(index: number): string {
        return this.settings.getAssetUrl('images/animations/' + this.defaultAnimation [index] + '.png');
    }

    public fillWithPattern(index: number) {
        this.fillTool.withPattern(this.getAnimationUrl(index));
    }
}
