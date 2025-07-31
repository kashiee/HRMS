import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { employeeAPI } from '../lib/api';
import { apiUtils } from '../lib/api';

const EmployeeEdit = () => {
  const { employeeReference } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);


  // Form state
  const [formData, setFormData] = useState({
    employee_number: '',
    first_name: '',
    last_name: '',
    date_of_birth: '',
    national_insurance_number: '',
    email: '',
    phone: '',
    address: '',
    postcode: '',
    employment_type: 'full_time',
    start_date: '',
    salary: '',
    hourly_rate: '',
    tax_code: '',
    pension_scheme: 'auto_enrolment',
    pension_contribution: '',
    company_id: 1,
    department_id: '',
    // NI Details
    ni_number: '',
    ni_letter: '',
    ni_category: '',
    bf_ni_calculation_basis: '',
    // Tax Details
    week1_month1: '',
    // Additional fields
    gender: '',
    title: '',
    address_1: '',
    address_2: '',
    address_3: '',
    address_4: '',
    country: '',
    marital_status: '',
    birth_date: '',
    employment_status: '',
    leaving_date: '',
    leaver: '',
    p45_1_if_required: '',
    director: '',
    director_start_date: '',
    director_leave_date: '',
    branch: '',
    cost_centre: '',
    run_group: '',
    default_cost_split: '',
    frequency: '',
    payment_method: '',
    bank_account_no: '',
    bank_account_name: '',
    sort_code: '',
    bank_name: '',
    bank_branch: '',
    building_society_ref: '',
    autopay_ref: '',
    taxable_pay_previous_employment: '',
    taxable_pay_this_employment: '',
    tax_previous_employment: '',
    tax_this_employment: '',
    net_pay_to_date: '',
    directors_earnings_to_date: '',
    bf_ni_letter: '',
    bf_total_earnings: '',
    bf_earnings_to_set: '',
    bf_earnings_to_lel: '',
    bf_earnings_to_pet: '',
    bf_earnings_to_fust: '',
    bf_earnings_to_ust: '',
    bf_earnings_above_uel: '',
    bf_ee_contributions_pt1: '',
    bf_ee_contributions_pt2: '',
    bf_er_contributions: '',
    student_loan_repayment_plan: '',
    student_loan_from_date: '',
    student_loan_to_date: '',
    student_loan_deducted: '',
    uk_tax_ytd: '',
    foreign_tax_ytd: '',
    foreign_tax_offset_ytd: '',
    standard_hours: '',
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    loadEmployeeData();
  }, [employeeReference]);

  const loadEmployeeData = async () => {
    try {
      setLoading(true);
      // Get comprehensive employee record data
      const employeeRecord = await employeeAPI.getEmployeeRecord(employeeReference);
      
      // Populate form with employee data
      setFormData({
        employee_number: employeeRecord.reference || '',
        first_name: employeeRecord.forename || '',
        last_name: employeeRecord.surname || '',
        date_of_birth: employeeRecord.birth_date || '',
        national_insurance_number: employeeRecord.ni_number || '',
        email: employeeRecord.email || '',
        phone: '',
        address: employeeRecord.address_1 || '',
        postcode: employeeRecord.postcode || '',
        employment_type: 'full_time',
        start_date: employeeRecord.start_date || '',
        salary: '',
        hourly_rate: '',
        tax_code: employeeRecord.tax_code || '',
        pension_scheme: 'auto_enrolment',
        pension_contribution: '',
        company_id: 1,
        department_id: employeeRecord.department || '',
        // NI Details
        ni_number: employeeRecord.ni_number || '',
        ni_letter: employeeRecord.ni_letter || '',
        ni_category: employeeRecord.ni_category || '',
        bf_ni_calculation_basis: employeeRecord.bf_ni_calculation_basis || '',
        // Tax Details
        week1_month1: employeeRecord.week1_month1 || '',
        // Additional fields
        gender: employeeRecord.gender || '',
        title: employeeRecord.title || '',
        address_1: employeeRecord.address_1 || '',
        address_2: employeeRecord.address_2 || '',
        address_3: employeeRecord.address_3 || '',
        address_4: employeeRecord.address_4 || '',
        country: employeeRecord.country || '',
        marital_status: employeeRecord.marital_status || '',
        birth_date: employeeRecord.birth_date || '',
        employment_status: employeeRecord.employment_status || '',
        leaving_date: employeeRecord.leaving_date || '',
        leaver: employeeRecord.leaver || '',
        p45_1_if_required: employeeRecord.p45_1_if_required || '',
        director: employeeRecord.director || '',
        director_start_date: employeeRecord.director_start_date || '',
        director_leave_date: employeeRecord.director_leave_date || '',
        branch: employeeRecord.branch || '',
        cost_centre: employeeRecord.cost_centre || '',
        run_group: employeeRecord.run_group || '',
        default_cost_split: employeeRecord.default_cost_split || '',
        frequency: employeeRecord.frequency || '',
        payment_method: employeeRecord.payment_method || '',
        bank_account_no: employeeRecord.bank_account_no || '',
        bank_account_name: employeeRecord.bank_account_name || '',
        sort_code: employeeRecord.sort_code || '',
        bank_name: employeeRecord.bank_name || '',
        bank_branch: employeeRecord.bank_branch || '',
        building_society_ref: employeeRecord.building_society_ref || '',
        autopay_ref: employeeRecord.autopay_ref || '',
        taxable_pay_previous_employment: employeeRecord.taxable_pay_previous_employment || '',
        taxable_pay_this_employment: employeeRecord.taxable_pay_this_employment || '',
        tax_previous_employment: employeeRecord.tax_previous_employment || '',
        tax_this_employment: employeeRecord.tax_this_employment || '',
        net_pay_to_date: employeeRecord.net_pay_to_date || '',
        directors_earnings_to_date: employeeRecord.directors_earnings_to_date || '',
        bf_ni_letter: employeeRecord.bf_ni_letter || '',
        bf_total_earnings: employeeRecord.bf_total_earnings || '',
        bf_earnings_to_set: employeeRecord.bf_earnings_to_set || '',
        bf_earnings_to_lel: employeeRecord.bf_earnings_to_lel || '',
        bf_earnings_to_pet: employeeRecord.bf_earnings_to_pet || '',
        bf_earnings_to_fust: employeeRecord.bf_earnings_to_fust || '',
        bf_earnings_to_ust: employeeRecord.bf_earnings_to_ust || '',
        bf_earnings_above_uel: employeeRecord.bf_earnings_above_uel || '',
        bf_ee_contributions_pt1: employeeRecord.bf_ee_contributions_pt1 || '',
        bf_ee_contributions_pt2: employeeRecord.bf_ee_contributions_pt2 || '',
        bf_er_contributions: employeeRecord.bf_er_contributions || '',
        student_loan_repayment_plan: employeeRecord.student_loan_repayment_plan || '',
        student_loan_from_date: employeeRecord.student_loan_from_date || '',
        student_loan_to_date: employeeRecord.student_loan_to_date || '',
        student_loan_deducted: employeeRecord.student_loan_deducted || '',
        uk_tax_ytd: employeeRecord.uk_tax_ytd || '',
        foreign_tax_ytd: employeeRecord.foreign_tax_ytd || '',
        foreign_tax_offset_ytd: employeeRecord.foreign_tax_offset_ytd || '',
        standard_hours: employeeRecord.standard_hours || '',
      });
    } catch (err) {
      setError(apiUtils.handleError(err).message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      
      await employeeAPI.updateEmployee(employeeReference, formData);
      
      setSuccess('Employee updated successfully!');
      setTimeout(() => {
        navigate(`/employee/${employeeReference}`);
      }, 1500);
    } catch (err) {
      setError(apiUtils.handleError(err).message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading"></div>
        <p>Loading employee data...</p>
      </div>
    );
  }

  return (
    <div className="employee-edit-page">
      <div className="page-container">
        {/* Header */}
        <div className="page-header">
          <div className="header-content">
            <button 
              className="btn btn-secondary"
              onClick={() => navigate(`/employee/${employeeReference}`)}
            >
              ← Back to Employee Details
            </button>
            <div className="header-info">
              <h1>Edit Employee</h1>
              <p className="header-subtitle">Employee Reference: {employeeReference}</p>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="alert alert-error">
            {error}
            <button 
              className="alert-close"
              onClick={() => setError(null)}
            >
              ×
            </button>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="alert alert-success">
            {success}
          </div>
        )}

        {/* Edit Form */}
        <div className="card">
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              {/* Personal Information */}
              <div className="form-section">
                <h4>Personal Information</h4>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Title</label>
                    <select
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="form-select"
                    >
                      <option value="">Select Title</option>
                      <option value="Mr">Mr</option>
                      <option value="Mrs">Mrs</option>
                      <option value="Ms">Ms</option>
                      <option value="Miss">Miss</option>
                      <option value="Dr">Dr</option>
                      <option value="Prof">Prof</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">First Name</label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Last Name</label>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Date of Birth</label>
                    <input
                      type="date"
                      name="date_of_birth"
                      value={formData.date_of_birth}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Gender</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="form-select"
                    >
                      <option value="">Select Gender</option>
                      <option value="M">Male</option>
                      <option value="F">Female</option>
                      <option value="O">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Marital Status</label>
                    <select
                      name="marital_status"
                      value={formData.marital_status}
                      onChange={handleInputChange}
                      className="form-select"
                    >
                      <option value="">Select Marital Status</option>
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                      <option value="Divorced">Divorced</option>
                      <option value="Widowed">Widowed</option>
                      <option value="Civil Partnership">Civil Partnership</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="form-section">
                <h4>Contact Information</h4>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Address Line 1</label>
                    <input
                      type="text"
                      name="address_1"
                      value={formData.address_1}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Address Line 2</label>
                    <input
                      type="text"
                      name="address_2"
                      value={formData.address_2}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Address Line 3</label>
                    <input
                      type="text"
                      name="address_3"
                      value={formData.address_3}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Address Line 4</label>
                    <input
                      type="text"
                      name="address_4"
                      value={formData.address_4}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Postcode</label>
                    <input
                      type="text"
                      name="postcode"
                      value={formData.postcode}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Country</label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              {/* Employment Details */}
              <div className="form-section">
                <h4>Employment Details</h4>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Employment Type</label>
                    <select
                      name="employment_type"
                      value={formData.employment_type}
                      onChange={handleInputChange}
                      className="form-select"
                      required
                    >
                      <option value="full_time">Full Time</option>
                      <option value="part_time">Part Time</option>
                      <option value="contractor">Contractor</option>
                      <option value="temporary">Temporary</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Department</label>
                    <input
                      type="text"
                      name="department_id"
                      value={formData.department_id}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Start Date</label>
                    <input
                      type="date"
                      name="start_date"
                      value={formData.start_date}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Leaving Date</label>
                    <input
                      type="date"
                      name="leaving_date"
                      value={formData.leaving_date}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Branch</label>
                    <input
                      type="text"
                      name="branch"
                      value={formData.branch}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Cost Centre</label>
                    <input
                      type="text"
                      name="cost_centre"
                      value={formData.cost_centre}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Run Group</label>
                    <input
                      type="text"
                      name="run_group"
                      value={formData.run_group}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Standard Hours</label>
                    <input
                      type="number"
                      name="standard_hours"
                      value={formData.standard_hours}
                      onChange={handleInputChange}
                      className="form-input"
                      step="0.5"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {/* National Insurance Details */}
              <div className="form-section">
                <h4>National Insurance Details</h4>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">NI Number</label>
                    <input
                      type="text"
                      name="ni_number"
                      value={formData.ni_number}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">NI Letter</label>
                    <input
                      type="text"
                      name="ni_letter"
                      value={formData.ni_letter}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">NI Category</label>
                    <select
                      name="ni_category"
                      value={formData.ni_category}
                      onChange={handleInputChange}
                      className="form-select"
                    >
                      <option value="">Select NI Category</option>
                      <option value="A">A - Standard</option>
                      <option value="B">B - Married Women</option>
                      <option value="C">C - Over State Pension Age</option>
                      <option value="D">D - Deferred</option>
                      <option value="E">E - Under 16</option>
                      <option value="F">F - Apprentice</option>
                      <option value="G">G - Contracted Out</option>
                      <option value="H">H - Apprentice Contracted Out</option>
                      <option value="I">I - Married Women Contracted Out</option>
                      <option value="J">J - Deferred Contracted Out</option>
                      <option value="K">K - Over State Pension Age Contracted Out</option>
                      <option value="L">L - Free of NI</option>
                      <option value="M">M - Under 21</option>
                      <option value="N">N - Over State Pension Age</option>
                      <option value="P">P - Under 21 Contracted Out</option>
                      <option value="Q">Q - Over State Pension Age Contracted Out</option>
                      <option value="R">R - Free of NI</option>
                      <option value="S">S - Under 21</option>
                      <option value="T">T - Over State Pension Age</option>
                      <option value="U">U - Under 21 Contracted Out</option>
                      <option value="V">V - Over State Pension Age Contracted Out</option>
                      <option value="W">W - Free of NI</option>
                      <option value="X">X - Under 21</option>
                      <option value="Y">Y - Over State Pension Age</option>
                      <option value="Z">Z - Free of NI</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">NI Calculation Basis</label>
                    <select
                      name="bf_ni_calculation_basis"
                      value={formData.bf_ni_calculation_basis}
                      onChange={handleInputChange}
                      className="form-select"
                    >
                      <option value="">Select Calculation Basis</option>
                      <option value="A">A - Standard</option>
                      <option value="B">B - Contracted Out</option>
                      <option value="C">C - Not Contracted Out</option>
                      <option value="D">D - Contracted Out</option>
                      <option value="E">E - Not Contracted Out</option>
                      <option value="F">F - Contracted Out</option>
                      <option value="G">G - Not Contracted Out</option>
                      <option value="H">H - Contracted Out</option>
                      <option value="I">I - Not Contracted Out</option>
                      <option value="J">J - Contracted Out</option>
                      <option value="K">K - Not Contracted Out</option>
                      <option value="L">L - Contracted Out</option>
                      <option value="M">M - Not Contracted Out</option>
                      <option value="N">N - Contracted Out</option>
                      <option value="O">O - Not Contracted Out</option>
                      <option value="P">P - Contracted Out</option>
                      <option value="Q">Q - Not Contracted Out</option>
                      <option value="R">R - Contracted Out</option>
                      <option value="S">S - Not Contracted Out</option>
                      <option value="T">T - Contracted Out</option>
                      <option value="U">U - Not Contracted Out</option>
                      <option value="V">V - Contracted Out</option>
                      <option value="W">W - Not Contracted Out</option>
                      <option value="X">X - Contracted Out</option>
                      <option value="Y">Y - Not Contracted Out</option>
                      <option value="Z">Z - Contracted Out</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Tax & Pension */}
              <div className="form-section">
                <h4>Tax & Pension</h4>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Tax Code</label>
                    <input
                      type="text"
                      name="tax_code"
                      value={formData.tax_code}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Week1 Month1</label>
                    <select
                      name="week1_month1"
                      value={formData.week1_month1}
                      onChange={handleInputChange}
                      className="form-select"
                    >
                      <option value="">Select</option>
                      <option value="W1">W1 - Week 1</option>
                      <option value="M1">M1 - Month 1</option>
                      <option value="X">X - Cumulative</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Pension Scheme</label>
                    <select
                      name="pension_scheme"
                      value={formData.pension_scheme}
                      onChange={handleInputChange}
                      className="form-select"
                      required
                    >
                      <option value="auto_enrolment">Auto Enrolment (NEST)</option>
                      <option value="workplace_pension">Workplace Pension</option>
                      <option value="personal_pension">Personal Pension (SIPP)</option>
                      <option value="group_personal_pension">Group Personal Pension (GPP)</option>
                      <option value="occupational_pension">Occupational Pension Scheme</option>
                      <option value="stakeholder_pension">Stakeholder Pension</option>
                      <option value="defined_benefit">Defined Benefit Pension</option>
                      <option value="defined_contribution">Defined Contribution Pension</option>
                      <option value="master_trust">Master Trust Pension</option>
                      <option value="contract_based">Contract-Based Pension</option>
                      <option value="trust_based">Trust-Based Pension</option>
                      <option value="executive_pension">Executive Pension Plan</option>
                      <option value="small_self_administered">Small Self-Administered Scheme (SSAS)</option>
                      <option value="self_invested">Self-Invested Personal Pension (SIPP)</option>
                      <option value="none">No Pension Scheme</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Pension Contribution (%)</label>
                    <input
                      type="number"
                      name="pension_contribution"
                      value={formData.pension_contribution}
                      onChange={handleInputChange}
                      className="form-input"
                      step="0.1"
                      min="0"
                      max="100"
                    />
                  </div>
                </div>
              </div>

              {/* Banking Information */}
              <div className="form-section">
                <h4>Banking Information</h4>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Bank Name</label>
                    <input
                      type="text"
                      name="bank_name"
                      value={formData.bank_name}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Bank Branch</label>
                    <input
                      type="text"
                      name="bank_branch"
                      value={formData.bank_branch}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Account Number</label>
                    <input
                      type="text"
                      name="bank_account_no"
                      value={formData.bank_account_no}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Account Name</label>
                    <input
                      type="text"
                      name="bank_account_name"
                      value={formData.bank_account_name}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Sort Code</label>
                    <input
                      type="text"
                      name="sort_code"
                      value={formData.sort_code}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Building Society Ref</label>
                    <input
                      type="text"
                      name="building_society_ref"
                      value={formData.building_society_ref}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Autopay Ref</label>
                    <input
                      type="text"
                      name="autopay_ref"
                      value={formData.autopay_ref}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => navigate(`/employee/${employeeReference}`)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeEdit; 