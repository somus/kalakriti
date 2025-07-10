'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
	ChartConfig,
	ChartContainer,
	ChartLegend,
	ChartLegendContent,
	ChartTooltip,
	ChartTooltipContent
} from '@/components/ui/chart';
import * as React from 'react';
import { Label, Pie, PieChart } from 'recharts';

export interface ChartData {
	name: string;
	value: number;
	fill: string;
}

export function ChartPieDonut({
	chartConfig,
	chartData,
	title,
	dataLabel
}: {
	title: string;
	dataLabel: string;
	chartConfig: ChartConfig;
	chartData: ChartData[];
}) {
	const total = React.useMemo(() => {
		return chartData.reduce((acc, curr) => acc + curr.value, 0);
	}, [chartData]);

	return (
		<Card className='flex flex-col h-full'>
			<CardHeader className='items-center pb-0'>
				<CardTitle>{title}</CardTitle>
			</CardHeader>
			<CardContent className='flex-1 pb-0'>
				<ChartContainer
					config={chartConfig}
					className='mx-auto w-full max-h-[300px] max-w-[600px]'
				>
					<PieChart width={600}>
						<ChartTooltip
							cursor={false}
							content={<ChartTooltipContent hideLabel />}
						/>
						<Pie
							data={chartData}
							dataKey='value'
							nameKey='name'
							innerRadius={60}
							strokeWidth={5}
						>
							<Label
								content={({ viewBox }) => {
									if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
										return (
											<text
												x={viewBox.cx}
												y={viewBox.cy}
												textAnchor='middle'
												dominantBaseline='middle'
											>
												<tspan
													x={viewBox.cx}
													y={viewBox.cy}
													className='fill-foreground text-3xl font-bold'
												>
													{total.toLocaleString()}
												</tspan>
												<tspan
													x={viewBox.cx}
													y={(viewBox.cy ?? 0) + 24}
													className='fill-muted-foreground'
												>
													{dataLabel}
												</tspan>
											</text>
										);
									}
								}}
							/>
						</Pie>
						<ChartLegend
							content={<ChartLegendContent nameKey='name' />}
							layout='vertical'
							align='right'
							verticalAlign='middle'
							className='flex-col'
							wrapperStyle={{
								padding: '0 2rem',
								height: '80%',
								overflow: 'auto'
							}}
						/>
					</PieChart>
				</ChartContainer>
			</CardContent>
		</Card>
	);
}
