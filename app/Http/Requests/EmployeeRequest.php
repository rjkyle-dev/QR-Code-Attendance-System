<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class EmployeeRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules()
    {
        $employeeId = $this->route('id');

        return [
            'email' => ['required', 'email', Rule::unique('employees')->ignore($employeeId)],
            'employeeid' => ['required', 'string', 'max:255', Rule::unique('employees')->ignore($employeeId)],
            'firstname' => 'required|string|max:255',
            'middlename' => 'nullable|string|max:255',
            'lastname' => 'required|string|max:255',
            'phone' => 'nullable|string',
            'gender' => 'required|string|max:255',
            'marital_status' => 'required|string|max:255',
            'address' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:255',
            'state' => 'nullable|string|max:255',
            'country' => 'nullable|string|max:255',
            'zip_code' => 'nullable|string|max:255',
            'work_status' => 'required|string|max:255',
            'service_tenure' => 'required|date',
            'date_of_birth' => 'required|date',
            'department' => 'required|string|max:255',
            'position' => 'required|string|max:255',
            'picture' => 'nullable|image|max:2048',
            'gmail_password' => 'nullable|string|max:255',
            'nbi_clearance' => 'nullable|file|mimes:pdf,doc,docx,jpg,jpeg,png,gif,bmp,tiff,txt,rtf|max:10240', // 10MB max
            // HDMF fields
            'hdmf_user_id' => 'nullable|string|max:255',
            // SSS fields
            'sss_user_id' => 'nullable|string|max:255',
            // Philhealth fields
            'philhealth_user_id' => 'nullable|string|max:255',
            // TIN fields
            'tin_user_id' => 'nullable|string|max:255',
            'fingerprint_template'    => 'nullable|string',
            'fingerprint_image'       => 'nullable|string',
            'fingerprint_captured_at' => 'nullable|date',
        ];
    }

    public function messages(): array
    {
        return [
            // Email validation messages
            'email.required' => 'Please enter the employee email address.',
            'email.email' => 'Please enter a valid email address.',
            'email.unique' => 'This email address is already registered to another employee.',
            
            // Employee ID validation messages
            'employeeid.required' => 'Please enter the employee ID.',
            'employeeid.string' => 'The employee ID must be a text value.',
            'employeeid.max' => 'The employee ID may not be greater than 255 characters.',
            'employeeid.unique' => 'This employee ID is already taken by another employee.',
            
            // Name validation messages
            'firstname.required' => 'Please enter the employee\'s first name.',
            'firstname.string' => 'The first name must be a text value.',
            'firstname.max' => 'The first name may not be greater than 255 characters.',
            
            'middlename.string' => 'The middle name must be a text value.',
            'middlename.max' => 'The middle name may not be greater than 255 characters.',
            
            'lastname.required' => 'Please enter the employee\'s last name.',
            'lastname.string' => 'The last name must be a text value.',
            'lastname.max' => 'The last name may not be greater than 255 characters.',
            
            // Phone validation messages
            'phone.string' => 'The phone number must be a text value.',
            
            // Gender validation messages
            'gender.required' => 'Please select the employee\'s gender.',
            'gender.string' => 'The gender must be a text value.',
            'gender.max' => 'The gender may not be greater than 255 characters.',
            
            // Marital status validation messages
            'marital_status.required' => 'Please select the employee\'s marital status.',
            'marital_status.string' => 'The marital status must be a text value.',
            'marital_status.max' => 'The marital status may not be greater than 255 characters.',
            
            // Address validation messages
            'address.string' => 'The address must be a text value.',
            'address.max' => 'The address may not be greater than 255 characters.',
            
            'city.string' => 'The city must be a text value.',
            'city.max' => 'The city may not be greater than 255 characters.',
            
            'state.string' => 'The state must be a text value.',
            'state.max' => 'The state may not be greater than 255 characters.',
            
            'country.string' => 'The country must be a text value.',
            'country.max' => 'The country may not be greater than 255 characters.',
            
            'zip_code.string' => 'The zip code must be a text value.',
            'zip_code.max' => 'The zip code may not be greater than 255 characters.',
            
            // Work status validation messages
            'work_status.required' => 'Please select the employee\'s work status.',
            'work_status.string' => 'The work status must be a text value.',
            'work_status.max' => 'The work status may not be greater than 255 characters.',
            
            // Date validation messages
            'service_tenure.required' => 'Please select the length of service date.',
            'service_tenure.date' => 'Please enter a valid service tenure date.',
            
            'date_of_birth.required' => 'Please select the employee\'s date of birth.',
            'date_of_birth.date' => 'Please enter a valid date of birth.',
            
            // Department and position validation messages
            'department.required' => 'Please select the employee\'s department.',
            'department.string' => 'The department must be a text value.',
            'department.max' => 'The department may not be greater than 255 characters.',
            
            'position.required' => 'Please select the employee\'s position.',
            'position.string' => 'The position must be a text value.',
            'position.max' => 'The position may not be greater than 255 characters.',
            
            // Profile picture validation messages
            'picture.image' => 'The profile picture must be an image file.',
            'picture.max' => 'The profile picture may not be greater than 2MB.',
            
            // Password validation messages
            'gmail_password.string' => 'The password must be a text value.',
            'gmail_password.max' => 'The password may not be greater than 255 characters.',
            
            // NBI Clearance validation messages
            'nbi_clearance.file' => 'The NBI Clearance must be a file.',
            'nbi_clearance.mimes' => 'The NBI Clearance must be a file of type: PDF, Word document, image, or text file.',
            'nbi_clearance.max' => 'The NBI Clearance may not be greater than 10MB.',
            
            // Fingerprint validation messages
            'fingerprint_template.string' => 'The fingerprint template must be a text value.',
            'fingerprint_image.string' => 'The fingerprint image must be a text value.',
            'fingerprint_captured_at.date' => 'Please enter a valid fingerprint capture date.',
        ];
    }
}
