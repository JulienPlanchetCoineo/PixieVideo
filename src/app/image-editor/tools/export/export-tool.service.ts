import {Injectable} from '@angular/core';
import {fabric} from 'fabric';
import {CanvasService} from '../../canvas/canvas.service';
import {CropZoneService} from '../crop/crop-zone.service';
import {HistoryToolService} from '../../history/history-tool.service';
import { saveAs } from 'file-saver';
import * as b64toBlob from 'b64-to-blob';
import {Settings} from 'common/core/config/settings.service';
import {HttpClient} from '@angular/common/http';
import {WatermarkToolService} from '../watermark-tool.service';
import {Toast} from 'common/core/ui/toast.service';
import {ucFirst} from '../../../../common/core/utils/uc-first';

//import { WebMWriter } from 'ccapture.js/src/webm-writer-0.2.0.js';
//import CCapture from 'ccapture.js/build/CCapture.all.min.js';
import WebMWriter from 'webm-writer';

import * as AWS from 'aws-sdk/global';
import * as S3 from 'aws-sdk/clients/s3';

type ValidFormats = 'png'|'jpeg'|'json'|'mp4'|'svr';

@Injectable()
export class ExportToolService {
    public isSavingVideo = false;

    constructor(
        private canvas: CanvasService,
        private cropzone: CropZoneService,
        private history: HistoryToolService,
        private config: Settings,
        private http: HttpClient,
        private watermark: WatermarkToolService,
        private toast: Toast,
    ) {}

    public getDefault(key: 'name'|'format'|'quality') {
        return this.config.get('pixie.tools.export.default' + ucFirst(key));
    }

    /**
     * Export current editor state in specified format.
     */
    public export(name?: string, format?: ValidFormats, quality?: number) {
        if ( ! name) name = this.getDefault('name');
        if ( ! format) format = this.getDefault('format');
        if ( ! quality) quality = this.getDefault('quality');

        const filename = name + '.' + format; let data;

        this.applyWaterMark();

        switch (format) {
            case 'json':
                data = this.getJsonState();
                break;
            case 'mp4':
                this.getCanvasVideo().then(blob => {
                    saveAs(blob, filename);
                });
                return;
            case 'svr':
                this.serverSideRender();
                break;
            default:
                data = this.getDataUrl(format, quality);
                break;
        }

        this.watermark.remove();

        if ( ! data) return;

        if (this.config.has('pixie.saveUrl')) {
            this.http.post(this.config.get('pixie.saveUrl'), {data, filename, format})
                .subscribe(() => {}, () => {});
        } else if (this.config.has('pixie.onSave')) {
            (this.config.get('pixie.onSave') as Function)(data, filename, format);
        } else {
            this.getCanvasBlob(format, data).then(blob => {
                saveAs(blob, filename);
            });
        }
    }

    private getCanvasVideo(): Promise<Blob> {
        return new Promise(resolve => {
            this.isSavingVideo = true;
            var objects = this.canvas.state.fabric.getObjects();
            var duration = 0;
            for (var i = 0; i < objects.length; i ++) {
                if (objects [i].type != "video")    continue;

                const videoE: HTMLVideoElement = objects [i]["getElement"]();
                videoE.pause();
                videoE.currentTime = 0;
                videoE.play();
                if (duration < videoE.duration) duration = videoE.duration;
            }

            var frameRate = 24.0;
            
            var videoWriter = new WebMWriter({
                quality: 0.95,    // WebM image quality from 0.0 (worst) to 1.0 (best)
                fd: null,         // Node.js file descriptor to write to instead of buffering to memory (optional)
            
                frameDuration: 1000 / frameRate, // Duration of frames in milliseconds
                frameRate: frameRate,     // Number of frames per second
            });
            
            const render = () => {
                if (videoWriter) {
                    videoWriter.addFrame(this.canvas.state.fabric);
                }
            }
            
            render();
            var timer = setInterval(render, 1000.0 / frameRate);

            setTimeout(() => {
                videoWriter.complete().then((webMBlob) => {
                    videoWriter = null;
                    clearInterval(timer);
                    this.isSavingVideo = false;
                    resolve(webMBlob);
                });
            }, duration * 1000);
        });
    }

    private getCanvasBlob(format: ValidFormats, data: string): Promise<Blob> {
        return new Promise(resolve => {
            let blob;

            if (format === 'json') {
                blob = new Blob([data], {type: 'application/json'});
            } else {
                const contentType = 'image/' + format;
                data = data.replace(/data:image\/([a-z]*)?;base64,/, '');
                blob = (b64toBlob as any)(data, contentType);
            }

            resolve(blob);
        });
    }

    /**
     * Export current editor state as data url.
     */
    public getDataUrl(format: ValidFormats = this.getDefault('format'), quality: number = this.getDefault('quality')): string {
        this.prepareCanvas();

        try {
            return this.canvas.fabric().toDataURL({
                format: format,
                quality: quality,
                multiplier: this.canvas.state.original.width / this.canvas.fabric().getWidth(),
            });
        } catch (e) {
            if (e.message.toLowerCase().indexOf('tainted') === -1) return null;
            this.toast.open('Could not export canvas with external image.');
        }
    }

    private getJsonState(): string {
        return JSON.stringify(this.history.getCurrentCanvasState());
    }

    private prepareCanvas() {
        this.canvas.fabric().discardActiveObject();
        this.canvas.pan.reset();
        this.cropzone.remove();
    }

    private applyWaterMark() {
        const watermark = this.config.get('pixie.watermarkText');

        if (watermark) {
            this.watermark.add(watermark);
        }
    }

    public serverSideRender() {
        let objects = this.canvas.fabric().getObjects("video");
        if (objects.length > 0) {
            let object: fabric.Image = <fabric.Image>objects [0];
            console.log(object.file);

            let { file } = object;

            const bucketName = "simpletest1234567890";
            const accessKey = "AKIAJULA2SE2F6GDS4MQ";
            const secretKey = "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";

            const bucket = new S3(
                {
                  accessKeyId: accessKey,
                  secretAccessKey: secretKey,
                }
              );
               
              const params = {
                Bucket: bucketName,
                Key: file.name,
                Body: file
              };
               
              bucket.upload(params, function (err, data) {
                  console.log("err", err);
                  console.log("data", data);
              });
        }
    }
}