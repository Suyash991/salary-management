'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { SalaryByCountryTable } from '@/components/analytics/SalaryByCountryTable'
import { SalaryByJobTitleTable } from '@/components/analytics/SalaryByJobTitleTable'
import { analyticsApi, employeeApi } from '@/lib/api'

export default function AnalyticsPage() {
  const [countryFilter, setCountryFilter] = useState<string | undefined>()

  const { data: meta } = useQuery({
    queryKey: ['employee-meta'],
    queryFn: employeeApi.filterMeta,
    staleTime: 5 * 60_000,
  })

  const { data: byCountry, isLoading: loadingCountry } = useQuery({
    queryKey: ['salary-by-country', countryFilter],
    queryFn: () => analyticsApi.salaryByCountry(countryFilter),
  })

  const { data: byJobTitle, isLoading: loadingJobTitle } = useQuery({
    queryKey: ['salary-by-job-title', countryFilter],
    queryFn: () => analyticsApi.salaryByJobTitle(countryFilter),
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Salary Insights</h1>
          <p className="text-sm text-gray-500 mt-1">Analyse compensation across the organisation</p>
        </div>
        <Select
          value={countryFilter ?? 'all'}
          onValueChange={(v: string | null) => setCountryFilter(!v || v === 'all' ? undefined : v)}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Countries" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Countries</SelectItem>
            {meta?.countries.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="by-country">
        <TabsList>
          <TabsTrigger value="by-country">By Country</TabsTrigger>
          <TabsTrigger value="by-job-title">By Job Title</TabsTrigger>
        </TabsList>

        <TabsContent value="by-country" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Salary Statistics by Country
                {countryFilter && <span className="text-gray-500 font-normal"> — {countryFilter}</span>}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {loadingCountry ? (
                <div className="text-gray-400 animate-pulse py-6 text-center">Loading…</div>
              ) : (
                <SalaryByCountryTable data={byCountry ?? []} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="by-job-title" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Average Salary by Job Title
                {countryFilter && <span className="text-gray-500 font-normal"> — {countryFilter}</span>}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {loadingJobTitle ? (
                <div className="text-gray-400 animate-pulse py-6 text-center">Loading…</div>
              ) : (
                <SalaryByJobTitleTable data={byJobTitle ?? []} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
