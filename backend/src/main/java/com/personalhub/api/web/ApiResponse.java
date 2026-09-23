package com.personalhub.api.web;

import com.personalhub.api.entity.Attachment;
import com.personalhub.api.entity.Contact;
import com.personalhub.api.entity.Interaction;
import com.personalhub.api.entity.Milestone;
import com.personalhub.api.entity.Project;
import com.personalhub.api.entity.Resource;
import com.personalhub.api.entity.Task;
import com.personalhub.api.entity.UserSetting;
import java.util.List;

public record ApiResponse(
    List<Project> projects,
    List<Milestone> milestones,
    List<Task> tasks,
    List<Contact> contacts,
    List<Interaction> interactions,
    List<Resource> resources,
    List<Attachment> attachments,
    UserSetting settings) {
}
