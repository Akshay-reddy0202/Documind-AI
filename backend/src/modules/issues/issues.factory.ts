import { prisma } from "../../config/prisma.js";
import { PrismaIssueRepository } from "./repositories/prisma-issue.repository.js";
import { IssuesService } from "./services/issues.service.js";

export const issueRepository = new PrismaIssueRepository(prisma);
export const issuesService = new IssuesService(issueRepository);
