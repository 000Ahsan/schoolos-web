import { Pipe, PipeTransform } from '@angular/core';
import { TerminologyService } from './terminology.service';

@Pipe({
    name: 'term',
    standalone: true,
    pure: false
})
export class TermPipe implements PipeTransform {
    constructor(private terminologyService: TerminologyService) {}

    transform(value: string): string {
        if (!value) return value;
        return this.terminologyService.translate(value);
    }
}
