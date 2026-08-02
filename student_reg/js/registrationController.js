/**
 * registrationController.js
 * Controller — Student Registration System
 *
 * Responsibilities:
 *  - Initialize the student model (form data)
 *  - Provide dropdown data (departments, courses, semesters, academic years)
 *  - Handle form submission with console.log output
 *  - Handle form reset
 */

app.controller('RegistrationController', ['$scope', function ($scope) {

    /* ─────────────────────────────────────────────
     * 1. MODEL — Student Data Object
     * ───────────────────────────────────────────── */
    $scope.student = {
        firstName    : '',
        lastName     : '',
        dob          : '',
        gender       : '',
        email        : '',
        mobile       : '',
        address      : '',
        city         : '',
        state        : '',
        pinCode      : '',
        department   : '',
        course       : '',
        semester     : '',
        academicYear : ''
    };

    // Holds the auto-generated admission number after successful submission
    $scope.generatedAdmissionNumber = null;

    /* ─────────────────────────────────────────────
     * HELPER — Generate Admission Number
     * Format : ADM-<YEAR>-<5-digit random number>
     * Example: ADM-2026-47823
     * ───────────────────────────────────────────── */
    function generateAdmissionNumber() {
        var year   = new Date().getFullYear();
        var digits = Math.floor(10000 + Math.random() * 90000); // always 5 digits
        return 'ADM-' + year + '-' + digits;
    }

    /* ─────────────────────────────────────────────
     * 2. DROPDOWN DATA
     * ───────────────────────────────────────────── */
    $scope.departments = [
        'Computer Science & Engineering',
        'Information Technology',
        'Electronics & Communication Engineering',
        'Electrical Engineering',
        'Mechanical Engineering',
        'Civil Engineering',
        'Business Administration',
        'Commerce',
        'Arts & Humanities',
        'Science'
    ];

    $scope.courses = [
        'B.Tech', 'B.E.', 'B.Sc.', 'B.Com.', 'B.A.', 'BBA',
        'M.Tech', 'M.Sc.', 'M.Com.', 'MBA', 'MCA', 'Ph.D.'
    ];

    $scope.semesters = [
        '1st Semester', '2nd Semester', '3rd Semester', '4th Semester',
        '5th Semester', '6th Semester', '7th Semester', '8th Semester'
    ];

    // Generate academic years dynamically: (currentYear - 2) to (currentYear + 3)
    $scope.academicYears = (function () {
        var years       = [];
        var currentYear = new Date().getFullYear();
        for (var i = currentYear - 2; i <= currentYear + 3; i++) {
            years.push(i + '-' + (i + 1));
        }
        return years;
    })();

    /* ─────────────────────────────────────────────
     * 3. UI STATE FLAGS
     * ───────────────────────────────────────────── */
    $scope.submitted          = false;  // tracks whether Submit was clicked
    $scope.registrationSuccess = false; // controls success banner visibility

    /* ─────────────────────────────────────────────
     * 4. SUBMIT HANDLER
     * ───────────────────────────────────────────── */
    $scope.submitForm = function (registrationForm) {
        $scope.submitted = true;

        // Stop if any field is invalid
        if (registrationForm.$invalid) {
            console.warn('[StudentReg] Form is invalid. Please fix the highlighted errors.');
            return;
        }

        // Auto-generate admission number on successful submission
        $scope.generatedAdmissionNumber = generateAdmissionNumber();

        // Build the complete student record including the generated admission number
        var studentRecord = angular.extend(
            angular.copy($scope.student),
            { admissionNumber: $scope.generatedAdmissionNumber }
        );

        // ── Log all student data to the browser console ──
        console.log('╔══════════════════════════════════════════════╗');
        console.log('║     STUDENT REGISTRATION — FORM SUBMITTED    ║');
        console.log('╚══════════════════════════════════════════════╝');

        console.log('▶ Personal Information');
        console.log('   First Name       :', studentRecord.firstName);
        console.log('   Last Name        :', studentRecord.lastName);
        console.log('   Date of Birth    :', studentRecord.dob);
        console.log('   Gender           :', studentRecord.gender);

        console.log('▶ Contact Information');
        console.log('   Personal Email   :', studentRecord.email);
        console.log('   Mobile Number    :', studentRecord.mobile);

        console.log('▶ Address');
        console.log('   Address          :', studentRecord.address);
        console.log('   City             :', studentRecord.city);
        console.log('   State            :', studentRecord.state);
        console.log('   PIN Code         :', studentRecord.pinCode);

        console.log('▶ Academic Information');
        console.log('   Admission No.    :', studentRecord.admissionNumber, '  ← auto-generated');
        console.log('   Department       :', studentRecord.department);
        console.log('   Course           :', studentRecord.course);
        console.log('   Semester         :', studentRecord.semester);
        console.log('   Academic Year    :', studentRecord.academicYear);

        console.log('▶ Full Student Record (for backend integration):');
        console.log(studentRecord);
        console.log('════════════════════════════════════════════════');

        $scope.registrationSuccess = true;
    };

    /* ─────────────────────────────────────────────
     * 5. RESET HANDLER
     * ───────────────────────────────────────────── */
    $scope.resetForm = function (registrationForm) {
        // Clear the model
        $scope.student = {
            firstName    : '',
            lastName     : '',
            dob          : '',
            gender       : '',
            email        : '',
            mobile       : '',
            address      : '',
            city         : '',
            state        : '',
            pinCode      : '',
            department   : '',
            course       : '',
            semester     : '',
            academicYear : ''
        };

        // Clear generated admission number and reset UI flags
        $scope.generatedAdmissionNumber = null;
        $scope.submitted                = false;
        $scope.registrationSuccess      = false;

        // Reset AngularJS form state (clears $dirty, $touched, $error)
        registrationForm.$setPristine();
        registrationForm.$setUntouched();
    };

}]);
