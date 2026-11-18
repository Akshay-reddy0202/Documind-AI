import type { PrismaClient, Prisma } from "../../../generated/prisma/client.js";
import type { IssueRepository } from "./issue.repository.js";
import type {
  IssueFilterQuery,
  IssueListItem,
  IssueStats,
  ClientOption,
} from "../types/index.js";

export class PrismaIssueRepository implements IssueRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findIssues(filters: IssueFilterQuery): Promise<{
    issues: IssueListItem[];
    totalCount: number;
  }> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const skip = (page - 1) * limit;

    const andConditions: Prisma.IssueWhereInput[] = [];

    // 1. Client Filter (match clientId or clientName case-insensitively)
    if (filters.clientId && filters.clientId.trim().length > 0) {
      const clientTerm = filters.clientId.trim();
      andConditions.push({
        document: {
          OR: [
            { clientId: { equals: clientTerm, mode: "insensitive" } },
            { clientName: { contains: clientTerm, mode: "insensitive" } },
          ],
        },
      });
    }

    // 2. Severity Filter (case-insensitive substring match, e.g. "P1" matches "P1 - Critical")
    if (filters.severity && filters.severity.trim().length > 0) {
      andConditions.push({
        severity: {
          contains: filters.severity.trim(),
          mode: "insensitive",
        },
      });
    }

    // 3. Status Filter (flexible match for descriptive report statuses)
    if (filters.status && filters.status.trim().length > 0) {
      const s = filters.status.trim().toUpperCase();
      if (s === "RESOLVED") {
        andConditions.push({
          OR: [
            { status: { contains: "RESOLVED", mode: "insensitive" } },
            { status: { contains: "FIXED", mode: "insensitive" } },
          ],
        });
      } else if (s === "OPEN") {
        andConditions.push({
          OR: [
            { status: { contains: "OPEN", mode: "insensitive" } },
            { status: { contains: "INVESTIGATING", mode: "insensitive" } },
          ],
        });
      } else if (s === "IN_PROGRESS") {
        andConditions.push({
          OR: [
            { status: { contains: "IN_PROGRESS", mode: "insensitive" } },
            { status: { contains: "PROGRESS", mode: "insensitive" } },
          ],
        });
      } else {
        andConditions.push({
          status: {
            contains: filters.status.trim(),
            mode: "insensitive",
          },
        });
      }
    }

    // 4. Free-text Search (searches issue code, title, component, description, severity, status, or client name)
    if (filters.search && filters.search.trim().length > 0) {
      const term = filters.search.trim();
      andConditions.push({
        OR: [
          { issueCode: { contains: term, mode: "insensitive" } },
          { title: { contains: term, mode: "insensitive" } },
          { component: { contains: term, mode: "insensitive" } },
          { description: { contains: term, mode: "insensitive" } },
          { severity: { contains: term, mode: "insensitive" } },
          { status: { contains: term, mode: "insensitive" } },
          {
            document: {
              OR: [
                { clientName: { contains: term, mode: "insensitive" } },
                { clientId: { contains: term, mode: "insensitive" } },
              ],
            },
          },
        ],
      });
    }

    const where: Prisma.IssueWhereInput =
      andConditions.length > 0 ? { AND: andConditions } : {};

    const [issues, totalCount] = await Promise.all([
      this.prisma.issue.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          document: {
            select: {
              id: true,
              fileName: true,
              clientId: true,
              clientName: true,
              environment: true,
              reportingPeriod: true,
            },
          },
        },
      }),
      this.prisma.issue.count({ where }),
    ]);

    return {
      issues,
      totalCount,
    };
  }

  async findIssueById(id: string): Promise<IssueListItem | null> {
    return this.prisma.issue.findUnique({
      where: { id },
      include: {
        document: {
          select: {
            id: true,
            fileName: true,
            clientId: true,
            clientName: true,
            environment: true,
            reportingPeriod: true,
          },
        },
      },
    });
  }

  async getStats(): Promise<IssueStats> {
    const [total, p1Count, openCount] = await Promise.all([
      this.prisma.issue.count(),
      this.prisma.issue.count({
        where: {
          severity: { contains: "P1", mode: "insensitive" },
        },
      }),
      this.prisma.issue.count({
        where: {
          OR: [
            { status: { contains: "OPEN", mode: "insensitive" } },
            { status: { contains: "INVESTIGATING", mode: "insensitive" } },
          ],
        },
      }),
    ]);

    return {
      total,
      p1Count,
      openCount,
    };
  }

  async getAvailableClients(): Promise<ClientOption[]> {
    const docs = await this.prisma.document.findMany({
      where: {
        clientId: { not: null },
      },
      select: {
        clientId: true,
        clientName: true,
      },
      distinct: ["clientId"],
    });

    return docs
      .filter(
        (d): d is { clientId: string; clientName: string | null } =>
          d.clientId !== null,
      )
      .map((d) => ({
        clientId: d.clientId,
        clientName: d.clientName ?? d.clientId,
      }));
  }
}
