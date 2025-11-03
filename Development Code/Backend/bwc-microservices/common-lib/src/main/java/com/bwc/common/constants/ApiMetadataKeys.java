package com.bwc.common.constants;

/**
 * Centralized metadata keys for API responses across all microservices.
 * 
 * This ensures consistency and eliminates duplicated string literals.
 */
public final class ApiMetadataKeys {

    private ApiMetadataKeys() {}

    public static final class Common {
        private Common() {}
        public static final String COUNT = "count";
        public static final String PAGINATION = "pagination";
    }

    public static final class Employee {
        private Employee() {}
        public static final String EMPLOYEE_ID = "employeeId";
        public static final String DEPARTMENT = "department";
        public static final String ROLE = "role";
        public static final String STATUS = "status";
        public static final String MANAGER_ID = "managerId";
    }

    public static final class Project {
        private Project() {}
        public static final String PROJECTS_ASSIGNED = "projectsAssigned";
        public static final String PROJECTS_REMOVED = "projectsRemoved";
    }
}
