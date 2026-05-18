import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AdminStats, AIModel, CustomerProject, FinalResult,
  HumanReview, Project, User
} from '../models/models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ── Admin ──────────────────────────────────────────────────────────────────

  getStats(): Observable<AdminStats> {
    return this.http.get<AdminStats>(`${this.base}/admin/stats`);
  }

  getCustomers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.base}/admin/customers`);
  }

  getAIModels(): Observable<AIModel[]> {
    return this.http.get<AIModel[]>(`${this.base}/admin/ai-models`);
  }

  createAIModel(data: { name: string; provider: string; modelIdentifier: string }): Observable<AIModel> {
    return this.http.post<AIModel>(`${this.base}/admin/ai-models`, data);
  }

  deleteAIModel(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/admin/ai-models/${id}`);
  }

  // ── Customer Portal ────────────────────────────────────────────────────────

  getMyProjects(): Observable<CustomerProject[]> {
    return this.http.get<CustomerProject[]>(`${this.base}/customer/projects`);
  }

  getProject(id: string): Observable<CustomerProject> {
    return this.http.get<CustomerProject>(`${this.base}/customer/projects/${id}`);
  }

  createProject(data: Partial<CustomerProject>): Observable<CustomerProject> {
    return this.http.post<CustomerProject>(`${this.base}/customer/projects`, data);
  }

  submitProject(id: string, guidelineText: string): Observable<any> {
    return this.http.post(`${this.base}/customer/projects/${id}/submit`, { guidelineText });
  }

  getResults(projectId: string): Observable<FinalResult[]> {
    return this.http.get<FinalResult[]>(`${this.base}/customer/projects/${projectId}/results`);
  }

  exportResults(projectId: string, format: string): Observable<Blob> {
    return this.http.get(`${this.base}/customer/projects/${projectId}/export`,
      { params: { format }, responseType: 'blob' });
  }

  // ── Internal / Review ──────────────────────────────────────────────────────

  getReviewQueue(page = 1): Observable<HumanReview[]> {
    return this.http.get<HumanReview[]>(`${this.base}/internal/human-reviews`,
      { params: { page: page.toString() } });
  }

  getNextReview(): Observable<HumanReview> {
    return this.http.get<HumanReview>(`${this.base}/internal/human-reviews/next`);
  }

  assignReview(id: string): Observable<HumanReview> {
    return this.http.post<HumanReview>(`${this.base}/internal/human-reviews/${id}/assign`, {});
  }

  completeReview(id: string, data: { decision: string; finalLabel?: string; notes?: string }): Observable<any> {
    return this.http.post(`${this.base}/internal/human-reviews/${id}/complete`, data);
  }

  // ── Projects ───────────────────────────────────────────────────────────────

  getProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.base}/projects`);
  }

  getProjectById(id: string): Observable<Project> {
    return this.http.get<Project>(`${this.base}/projects/${id}`);
  }

  createInternalProject(data: Partial<Project>): Observable<Project> {
    return this.http.post<Project>(`${this.base}/projects`, data);
  }
}
