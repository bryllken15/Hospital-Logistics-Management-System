# Row Level Security (RLS) Policies Guide

## Overview

This document explains the comprehensive Row Level Security (RLS) policies implemented for the Logistics1 Hospital System. These policies ensure that users can only access data appropriate to their role and permissions.

## Role-Based Access Control

### User Roles

1. **Admin** - Full system access
2. **Manager** - Department management and approval authority
3. **Project Manager** - Project oversight and resource management
4. **Employee (SWS)** - Inventory and warehouse operations
5. **Procurement Staff** - Purchase orders and supplier management
6. **Maintenance Staff** - Asset tracking and maintenance
7. **Document Analyst** - Document verification and record management

### Permission Levels

- **Admin**: Full access to all data and operations
- **Manager**: Department-level access with approval authority
- **Project Manager**: Project-specific access with approval authority
- **Staff Roles**: Role-specific data access with limited permissions

## Enhanced Security Features

### 1. Advanced Role Checking Functions

```sql
-- Get current user's role
get_current_user_role()

-- Check if user has specific role
has_role(required_role)

-- Check if user has any of multiple roles
has_any_role(required_roles[])

-- Check if user is admin or manager
is_admin_or_manager()

-- Check if user can approve requests
is_approval_role()
```

### 2. Approval Chain Logic

The system implements a multi-level approval chain:

- **Employee → Manager → Project Manager**
- **Procurement Staff → Manager → Project Manager**
- **Document Analyst → Manager → Project Manager**

### 3. Department-Based Access

Managers can only access data within their department:

```sql
-- Managers can view users in their department
CREATE POLICY "Managers can view users in their department" ON public.users
    FOR SELECT USING (
        has_role('Manager') AND 
        EXISTS (
            SELECT 1 FROM public.projects p
            JOIN public.staff_assignments sa ON p.id = sa.project_id
            WHERE sa.user_id = users.id
            AND p.department = (
                SELECT p2.department FROM public.projects p2
                WHERE p2.project_manager_id = auth.uid() 
                LIMIT 1
            )
        )
    );
```

## Table-Specific Policies

### Users Table

- **Own Profile**: Users can view and update their own profile
- **Admin Access**: Admins can view and manage all users
- **Manager Access**: Managers can view users in their department
- **Self-Update**: Users can update their own profile

### Projects Table

- **Project Access**: Users can view projects they're assigned to
- **Manager Access**: Project managers can manage their projects
- **Department Access**: Managers can view all projects
- **Admin Access**: Admins have full access

### Procurement Requests

- **Own Requests**: Users can view their own requests
- **Approval Access**: Approvers can view requests they need to approve
- **Department Access**: Managers can view department requests
- **Status-Based**: Access depends on request status

### Purchase Orders

- **Creator Access**: Users can view orders they created
- **Procurement Access**: Procurement staff can manage orders
- **Approval Access**: Managers can approve orders
- **Status-Based**: Access depends on order status

### Inventory Items

- **Public Read**: All users can view inventory
- **SWS Management**: SWS employees can manage inventory
- **Analytics Access**: Managers can view inventory analytics

### Assets

- **Public Read**: All users can view assets
- **Maintenance Management**: Maintenance staff can manage assets
- **Analytics Access**: Managers can view asset analytics

### Documents

- **Uploader Access**: Users can view documents they uploaded
- **Verification Access**: Document analysts can manage documents
- **Status-Based**: Access depends on document status
- **Manager Access**: Managers can view all documents

### Workflows

- **Initiator Access**: Users can view workflows they initiated
- **Approval Access**: Approvers can view workflows they need to approve
- **Manager Access**: Managers can view all workflows
- **Step-Based**: Access depends on current workflow step

### Notifications

- **Personal Access**: Users can view their own notifications
- **System Creation**: System can create notifications
- **Update Access**: Users can update their notifications

### System Activities

- **Admin Access**: Admins can view all activities
- **Personal Access**: Users can view their own activities
- **Department Access**: Managers can view department activities

### Audit Logs

- **Admin Only**: Only admins can view audit logs
- **System Creation**: System can create audit logs

## Security Features

### 1. Permission Checking

```sql
-- Check if user has permission for specific action
has_permission(action, resource)
```

### 2. Security Event Logging

```sql
-- Log security events
log_security_event(event_type, description, severity)
```

### 3. Data Change Tracking

All data changes are automatically logged with:
- User who made the change
- Timestamp of the change
- Old and new values
- IP address and user agent

### 4. Performance Optimization

Indexes are created for better query performance:

```sql
-- User role and status
CREATE INDEX idx_users_role_active ON public.users(role, is_active);

-- Project manager and department
CREATE INDEX idx_projects_manager_department ON public.projects(project_manager_id, department);

-- Staff assignments
CREATE INDEX idx_staff_assignments_user_project ON public.staff_assignments(user_id, project_id);

-- Procurement requests status and role
CREATE INDEX idx_procurement_requests_status_role ON public.procurement_requests(status, requested_by);

-- Workflow instances step and role
CREATE INDEX idx_workflow_instances_step_role ON public.workflow_instances(current_step_role, status);

-- Notifications user and read status
CREATE INDEX idx_notifications_user_read ON public.notifications(user_id, is_read);

-- System activities user and action
CREATE INDEX idx_system_activities_user_action ON public.system_activities(user_id, action);
```

## Approval Workflow Security

### Request Creation
- Users can only create requests for themselves
- Requests are automatically assigned to the appropriate approval chain

### Approval Process
- Only designated approvers can approve requests
- Approval chain is enforced at the database level
- Status changes are tracked and logged

### Status-Based Access
- Pending requests: Visible to approvers
- Approved requests: Visible to project managers
- Rejected requests: Visible to creator and admins

## Department-Based Security

### Manager Access
- Managers can only access data within their department
- Department is determined by project assignments
- Cross-department access is restricted

### Project Access
- Users can only access projects they're assigned to
- Project managers can access their projects
- Admins can access all projects

## Real-Time Security

### Subscription Access
- Real-time subscriptions respect RLS policies
- Users only receive updates for data they can access
- Security is maintained in real-time updates

### Notification Security
- Notifications are only sent to authorized users
- Role-based notification filtering
- Sensitive information is protected

## Best Practices

### 1. Principle of Least Privilege
- Users only get access to data they need
- Role-based permissions are strictly enforced
- Unnecessary access is prevented

### 2. Audit Trail
- All actions are logged
- Security events are tracked
- Data changes are recorded

### 3. Performance
- Indexes optimize query performance
- Policies are designed for efficiency
- Real-time updates are optimized

### 4. Security Monitoring
- Failed access attempts are logged
- Suspicious activity is tracked
- Security events are monitored

## Troubleshooting

### Common Issues

1. **Access Denied**: Check user role and permissions
2. **Missing Data**: Verify RLS policies allow access
3. **Performance Issues**: Check if indexes are being used
4. **Real-time Issues**: Verify subscription permissions

### Debugging

1. Check user role: `SELECT get_current_user_role();`
2. Verify permissions: `SELECT has_permission('action', 'resource');`
3. Check policy conditions: Review RLS policy logic
4. Monitor audit logs: Check for access attempts

## Migration Order

The enhanced RLS policies should be applied after the basic RLS policies:

1. `009_rls_policies.sql` - Basic RLS setup
2. `015_enhanced_rls_policies.sql` - Enhanced security features

## Testing

### Test Cases

1. **Role Access**: Verify each role can only access appropriate data
2. **Approval Chain**: Test multi-level approval workflow
3. **Department Access**: Verify department-based restrictions
4. **Real-time Security**: Test real-time subscription security
5. **Audit Logging**: Verify all actions are logged

### Security Testing

1. **Unauthorized Access**: Attempt to access restricted data
2. **Role Escalation**: Try to access higher privilege data
3. **Cross-Department**: Attempt cross-department access
4. **Data Leakage**: Verify no data leakage between roles

## Conclusion

The enhanced RLS policies provide comprehensive security for the Logistics1 Hospital System, ensuring that:

- Users can only access data appropriate to their role
- Approval workflows are secure and auditable
- Department-based access is enforced
- All actions are logged and monitored
- Performance is optimized with proper indexing
- Real-time updates maintain security

This security model ensures that sensitive hospital logistics data is protected while maintaining the functionality needed for efficient operations.
