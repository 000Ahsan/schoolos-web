import { NgModule } from '@angular/core';
import { TermPipe } from './term.pipe';

@NgModule({
    imports: [TermPipe],
    exports: [TermPipe]
})
export class TerminologyModule {}

