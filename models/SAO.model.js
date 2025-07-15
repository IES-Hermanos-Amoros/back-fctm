// models/Dato.js
class SAO_Data {
    constructor(
                id = null, profile = null, username = null, registryDate = null, accessDate = null, name = null, organization = null, group=null, email = null, phone = null,
                student_id = null, student_socialNumber = null, student_city = null, student_state = null, student_codeState = null, student_address = null, student_gender = null, student_visibleCompanies = null,
                company_FCT_Number = null, company_FCT_Date = null, company_FPDual_Number = null, company_FPDual_Date = null,company_fax = null, company_city = null, company_state = null, company_codeState = null, company_address = null, company_activity = null, company_nameManager = null, company_idManager = null, company_notaryState = null, company_notaryCity = null, company_notaryName = null, company_protocolNumber = null, company_deedDate = null
    ) {
        this.SAO_id = id;
        this.SAO_profile = profile;
        this.SAO_username = username;
        this.SAO_registryDate = registryDate;
        this.SAO_accessDate = accessDate;
        this.SAO_name = name;
        this.SAO_organization = organization;
        this.SAO_group = group;
        this.SAO_email = email;
        this.SAO_phone = phone;

        this.SAO_student_id = student_id
        this.SAO_student_socialNumber = student_socialNumber;
        this.SAO_student_city = student_city;
        this.SAO_student_state = student_state;
        this.SAO_student_codeState = student_codeState;
        this.SAO_student_address = student_address;
        this.SAO_student_gender = student_gender;
        this.SAO_student_visibleCompanies = student_visibleCompanies;

        this.SAO_company_FCT_Number = company_FCT_Number;
        this.SAO_company_FCT_Date = company_FCT_Date;
        this.SAO_company_FPDual_Number = company_FPDual_Number;
        this.SAO_company_FPDual_Date = company_FPDual_Date;
        this.SAO_company_fax = company_fax;
        this.SAO_company_city = company_city;
        this.SAO_company_state = company_state;
        this.SAO_company_codeState = company_codeState;
        this.SAO_company_address = company_address;
        this.SAO_company_activity = company_activity;
        this.SAO_company_nameManager = company_nameManager;
        this.SAO_company_idManager = company_idManager;
        this.SAO_company_notaryState = company_notaryState;
        this.SAO_company_notaryCity = company_notaryCity;
        this.SAO_company_notaryName = company_notaryName;
        this.SAO_company_protocolNumber = company_protocolNumber;
        this.SAO_company_deedDate = company_deedDate;
    }
}

class SAO_Data_Student extends SAO_Data {
    constructor(
                id = null, profile = null, username = null, registryDate = null, accessDate = null, name = null, organization = null, group=null,email = null, phone = null,
                student_id = null, student_socialNumber = null, student_city = null, student_state = null, student_codeState = null, student_address = null, student_gender = null, student_visibleCompanies = null           
    ) {
        super(id,profile,username,registryDate,accessDate,name,organization,group,email,phone)

        this.SAO_student_id = student_id
        this.SAO_student_socialNumber = student_socialNumber;
        this.SAO_student_city = student_city;
        this.SAO_student_state = student_state;
        this.SAO_student_codeState = student_codeState;
        this.SAO_student_address = student_address;
        this.SAO_student_gender = student_gender;
        this.SAO_student_visibleCompanies = student_visibleCompanies;

        this.SAO_company_FCT_Number = null;
        this.SAO_company_FCT_Date = null;
        this.SAO_company_FPDual_Number = null;
        this.SAO_company_FPDual_Date = null;
        this.SAO_company_fax = null;
        this.SAO_company_city = null;
        this.SAO_company_state = null;
        this.SAO_company_codeState = null;
        this.SAO_company_address = null;
        this.SAO_company_activity = null;
        this.SAO_company_nameManager = null;
        this.SAO_company_idManager = null;
        this.SAO_company_notaryState = null;
        this.SAO_company_notaryCity = null;
        this.SAO_company_notaryName = null;
        this.SAO_company_protocolNumber = null;
        this.SAO_company_deedDate = null;
    }
}

class SAO_Data_Company extends SAO_Data {
    constructor(
        id = null, profile = null, username = null, registryDate = null, accessDate = null, name = null, organization = null, group=null,email = null, phone = null,
        company_FCT_Number = null, company_FCT_Date = null, company_FPDual_Number = null, company_FPDual_Date = null,company_fax = null, company_city = null, company_state = null, company_codeState = null, company_address = null, company_activity = null, company_nameManager = null, company_idManager = null, company_notaryState = null, company_notaryCity = null, company_notaryName = null, company_protocolNumber = null, company_deedDate = null

) {
        super(id,profile,username,registryDate,accessDate,name,organization,group,email,phone)

        this.SAO_student_id = null
        this.SAO_student_socialNumber = null;
        this.SAO_student_city = null;
        this.SAO_student_state = null;
        this.SAO_student_codeState = null;
        this.SAO_student_address = null;
        this.SAO_student_gender = null;
        this.SAO_student_visibleCompanies = null;

        this.SAO_company_FCT_Number = company_FCT_Number;
        this.SAO_company_FCT_Date = company_FCT_Date;
        this.SAO_company_FPDual_Number = company_FPDual_Number;
        this.SAO_company_FPDual_Date = company_FPDual_Date;
        this.SAO_company_fax = company_fax;
        this.SAO_company_city = company_city;
        this.SAO_company_state = company_state;
        this.SAO_company_codeState = company_codeState;
        this.SAO_company_address = company_address;
        this.SAO_company_activity = company_activity;
        this.SAO_company_nameManager = company_nameManager;
        this.SAO_company_idManager = company_idManager;
        this.SAO_company_notaryState = company_notaryState;
        this.SAO_company_notaryCity = company_notaryCity;
        this.SAO_company_notaryName = company_notaryName;
        this.SAO_company_protocolNumber = company_protocolNumber;
        this.SAO_company_deedDate = company_deedDate;
    }    
}

class SAO_Data_FCT {
    constructor(fct_id = null, student_course = null, student_id = null, company_id = null, 
        workcenter_name = null, workcenter_phone = null, workcenter_manager = null, workcenter_manager_id = null, workcenter_city = null, workcenter_email = null, 
        teacher_id = null, instructor_name = null, instructor_name_id = null, period = null, dates = null, schedule = null, hours = null, department = null, type = null, authorization = null, erasmus = null, termination_date = null, instructor_assessment = null, observation = null, variation = null, link = null, amount = null
    ){
        this.SAO_fct_id = fct_id,
        this.SAO_student_course = student_course,
        this.SAO_student_id = student_id, //NIA
        this.SAO_company_id = company_id, //CIF
        this.SAO_workcenter_name = workcenter_name,
        this.SAO_workcenter_phone = workcenter_phone,
        this.SAO_workcenter_manager = workcenter_manager,
        this.SAO_workcenter_manager_id = workcenter_manager_id,
        this.SAO_workcenter_city = workcenter_city,
        this.SAO_workcenter_email = workcenter_email,
        this.SAO_teacher_id = teacher_id, //NIF
        this.SAO_instructor_name = instructor_name,
        this.SAO_instructor_id = instructor_name_id,
        this.SAO_period = period,
        this.SAO_dates = dates,
        this.SAO_schedule = schedule,
        this.SAO_hours = hours,
        this.SAO_department = department,
        this.SAO_type = type,
        this.SAO_Authorization = authorization,
        this.SAO_Erasmus = erasmus,
        this.SAO_termination_date = termination_date,
        this.SAO_instructor_assessment = instructor_assessment,
        this.SAO_observation = observation
        this.SAO_variation = variation,
        this.SAO_link = link,
        this.SAO_amount = amount
    }
}

module.exports = {SAO_Data,SAO_Data_Student, SAO_Data_Company, SAO_Data_FCT};
