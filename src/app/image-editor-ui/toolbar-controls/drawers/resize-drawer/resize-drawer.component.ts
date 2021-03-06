import {ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation} from '@angular/core';
import {EditorControlsService} from '../../editor-controls.service';
import {CanvasService} from '../../../../image-editor/canvas/canvas.service';
import {HistoryToolService} from '../../../../image-editor/history/history-tool.service';
import {ResizeToolService} from '../../../../image-editor/tools/resize/resize-tool.service';
import {Toast} from 'common/core/ui/toast.service';
import {Store} from '@ngxs/store';
import {SetResizeDimensions} from '../../../state/resize/resize.actions';
import {FormControl, FormGroup} from '@angular/forms';
import {debounceTime, filter} from 'rxjs/operators';
import {ApplyChanges} from '../../../../image-editor/state/editor-state-actions';
import {ResizeState} from '../../../state/resize/resize.state';
import {DrawerName} from '../drawer-name.enum';
import {EditorState} from '../../../../image-editor/state/editor-state';

@Component({
    selector: 'resize-drawer',
    templateUrl: './resize-drawer.component.html',
    styleUrls: ['./resize-drawer.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {'class': 'controls-drawer'},
})
export class ResizeDrawerComponent implements OnInit {
    public resizeForm = new FormGroup({
        width: new FormControl(),
        height: new FormControl(),
        usePercentages: new FormControl(false),
        maintainAspectRatio: new FormControl(true),
    });

    constructor(
        private canvas: CanvasService,
        protected history: HistoryToolService,
        private resizeTool: ResizeToolService,
        public controls: EditorControlsService,
        private toast: Toast,
        private store: Store,
    ) {}

    ngOnInit() {
        this.resizeForm.patchValue({
            width: this.resizeForm.value.usePercentages ? 100 : this.canvas.state.original.width,
            height: this.resizeForm.value.usePercentages ? 100 : this.canvas.state.original.height,
        });

        this.bindToWidthControl();
        this.bindToHeightControl();
        this.bindToPercentageControl();
        this.syncFormWithState();
    }

    public applyChanges() {
        if (this.store.selectSnapshot(ResizeState.dirty)) {
            this.store.dispatch(new ApplyChanges(DrawerName.RESIZE));
        }
    }

    private syncFormWithState() {
        this.resizeForm.valueChanges
            .pipe(
                debounceTime(200),
                filter(() => this.store.selectSnapshot(EditorState.activePanel) === DrawerName.RESIZE)
            )
            .subscribe(() => {
                // get current values form because "emitEvent: false" is used
                this.store.dispatch(new SetResizeDimensions(this.resizeForm.getRawValue()));
            });
    }

    private bindToPercentageControl() {
        this.resizeForm.get('usePercentages').valueChanges.subscribe(usePercentages => {
            if (usePercentages) {
                this.resizeForm.patchValue({
                    width: 100,
                    height: 100
                });
            } else {
                this.resizeForm.patchValue({
                    width: this.canvas.state.original.width,
                    height: this.canvas.state.original.height,
                });
            }
        });
    }

    private bindToWidthControl() {
        // if "maintainAspectRatio" is enabled, update "height" on "width" change.
        this.resizeForm.get('width').valueChanges
            .pipe(filter(() => this.resizeForm.value.maintainAspectRatio))
            .subscribe(value => {
                this.resizeForm.get('height').setValue(this.aspectToHeight(value), {emitEvent: false});
            });
    }

    private bindToHeightControl() {
        // if "maintainAspectRatio" is enabled, update "width" on "height" change.
        this.resizeForm.get('height').valueChanges
            .pipe(filter(() => this.resizeForm.value.maintainAspectRatio))
            .subscribe(value => {
                this.resizeForm.get('width').setValue(this.aspectToWidth(value), {emitEvent: false});
            });
    }

    /**
     * Maintain aspect ratio when setting height.
     */
    private aspectToWidth(newHeight: number): number {
        if (this.resizeForm.value.usePercentages) {
            return newHeight;
        } else {
            const hRatio = parseFloat((this.canvas.state.original.height / newHeight).toPrecision(3));
            return Math.floor(this.canvas.state.original.width / hRatio);
        }
    };

    /**
     * Maintain aspect ratio when setting width.
     */
    private aspectToHeight(newWidth: number): number {
        if (this.resizeForm.value.usePercentages) {
            return newWidth;
        } else {
            const wRatio = parseFloat((this.canvas.state.original.width / newWidth).toPrecision(3));
            return Math.floor(this.canvas.state.original.height / wRatio);
        }
    };
}
