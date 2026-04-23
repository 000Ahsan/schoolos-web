import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class TerminologyService {
    private currentType: string = 'school';

    private dictionaries: Record<string, Record<string, string>> = {
        school: {
            'School': 'School',
            'Schools': 'Schools',
            'Student': 'Student',
            'Students': 'Students',
            'Class': 'Class',
            'Classes': 'Classes',
            'Academic Year': 'Academic Year',
            'Academic Years': 'Academic Years'
        },
        coaching: {
            'School': 'Coaching Center',
            'Schools': 'Coaching Centers',
            'Student': 'Student',
            'Students': 'Students',
            'Class': 'Batch',
            'Classes': 'Batches',
            'Academic Year': 'Session',
            'Academic Years': 'Sessions'
        },
        academy: {
            'School': 'Academy',
            'Schools': 'Academies',
            'Student': 'Learner',
            'Students': 'Learners',
            'Class': 'Course',
            'Classes': 'Courses',
            'Academic Year': 'Session',
            'Academic Years': 'Sessions'
        }
    };

    setOrganizationType(type: string): void {
        if (this.dictionaries[type]) {
            this.currentType = type;
        } else {
            this.currentType = 'school';
        }
    }

    translate(term: string): string {
        const dict = this.dictionaries[this.currentType];
        
        // Exact match
        if (dict && dict[term]) {
            return dict[term];
        }

        // Case-insensitive match fallback
        const lowerTerm = term.toLowerCase();
        for (const [key, value] of Object.entries(dict)) {
            if (key.toLowerCase() === lowerTerm) {
                // Return matched value, trying to match case of original term
                if (term === term.toUpperCase()) return value.toUpperCase();
                if (term === term.toLowerCase()) return value.toLowerCase();
                return value; 
            }
        }

        return term;
    }
}
